from flask import Flask, render_template, request, redirect, jsonify
import socket
import os
import logging
import psycopg2
from psycopg2.extras import DictCursor
import redis
import json
import time

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Conexão com o Redis
def get_redis():
    redis_url = os.environ.get('REDIS_URL', 'redis://redis:6379/0')
    return redis.from_url(redis_url)


@app.before_request
def log_request_info():
    hostname = socket.gethostname()
    # Pega a porta do ambiente ou usa 5000 como padrão
    port = os.environ.get('PORT', '5000')
    logger.info(f"Requisição recebida em {hostname} na porta {port}")

    # Incrementa contador de acessos no Redis
    try:
        r = get_redis()
        r.incr('access_count')
        r.hincrby('access_by_path', request.path, 1)
    except Exception as e:
        logger.error(f"Erro ao registrar acesso no Redis: {str(e)}")


def connect_db():
    database_url = os.environ.get(
        'DATABASE_URL', 'postgresql://postgres:postgres@db:5432/todolist')
    conn = psycopg2.connect(database_url)
    conn.autocommit = True
    return conn


@app.route('/env')
def env():
    return str(os.environ)


@app.route('/oi')
def hello():
    hostname = socket.gethostname()
    # Pega a porta do ambiente ou usa 5000 como padrão
    port = os.environ.get('PORT', '5000')
    logger.info(f"Requisição recebida em {hostname} na porta {port}")
    return f"Hello from {hostname} on port {port}!\n"


@app.route('/')
def index():
    try:
        # Tenta obter do cache primeiro
        r = get_redis()
        cached_tasks = r.get('tasks_cache')

        if cached_tasks:
            logger.info("Usando dados do cache Redis")
            tasks_list = json.loads(cached_tasks)
        else:
            logger.info("Buscando dados do PostgreSQL")
            con = connect_db()
            cur = con.cursor(cursor_factory=DictCursor)
            cur.execute("SELECT * FROM tasks")
            tasks = cur.fetchall()
            con.close()

            # Transformando o resultado em uma lista de tuplas (id, task, completed)
            tasks_list = [(task['id'], task['task'], task['completed'])
                          for task in tasks]

            # Armazena no cache por 30 segundos
            r.setex('tasks_cache', 30, json.dumps(tasks_list))

        return render_template("index.html", tasks=tasks_list)
    except Exception as e:
        logger.error(f"Erro ao buscar tarefas: {str(e)}")
        return render_template("index.html", tasks=[], error=str(e))


@app.route('/add', methods=['POST'])
def add_task():
    task = request.form['task']
    try:
        con = connect_db()
        cur = con.cursor()
        cur.execute(
            "INSERT INTO tasks (task, completed) VALUES (%s, %s)", (task, 0))
        con.close()

        # Invalida o cache
        r = get_redis()
        r.delete('tasks_cache')

        # Registra estatística de adição de tarefa
        r.incr('tasks_added')

        return redirect('/')
    except Exception as e:
        logger.error(f"Erro ao adicionar tarefa: {str(e)}")
        return redirect('/')


@app.route('/delete/<int:id>')
def delete_task(id):
    try:
        con = connect_db()
        cur = con.cursor()
        cur.execute("DELETE FROM tasks WHERE id=%s", (id,))
        con.close()

        # Invalida o cache
        r = get_redis()
        r.delete('tasks_cache')

        # Registra estatística de remoção de tarefa
        r.incr('tasks_deleted')

        return redirect('/')
    except Exception as e:
        logger.error(f"Erro ao excluir tarefa: {str(e)}")
        return redirect('/')


@app.route('/complete/<int:id>')
def complete_task(id):
    try:
        con = connect_db()
        cur = con.cursor()
        cur.execute("UPDATE tasks SET completed = 1 WHERE id=%s", (id,))
        con.close()

        # Invalida o cache
        r = get_redis()
        r.delete('tasks_cache')

        # Registra estatística de conclusão de tarefa
        r.incr('tasks_completed')

        return redirect('/')
    except Exception as e:
        logger.error(f"Erro ao completar tarefa: {str(e)}")
        return redirect('/')


@app.route('/stats')
def stats():
    try:
        r = get_redis()
        stats = {
            'access_count': int(r.get('access_count') or 0),
            'tasks_added': int(r.get('tasks_added') or 0),
            'tasks_completed': int(r.get('tasks_completed') or 0),
            'tasks_deleted': int(r.get('tasks_deleted') or 0),
            'access_by_path': {k.decode(): int(v) for k, v in r.hgetall('access_by_path').items()}
        }
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Erro ao buscar estatísticas: {str(e)}")
        return jsonify({'error': str(e)})


@app.route('/health')
def health():
    health_data = {
        'status': 'ok',
        'timestamp': time.time(),
        'hostname': socket.gethostname(),
        'services': {}
    }

    # Verifica conexão com o PostgreSQL
    try:
        conn = connect_db()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.fetchone()
        conn.close()
        health_data['services']['database'] = 'ok'
    except Exception as e:
        health_data['services']['database'] = f'error: {str(e)}'
        health_data['status'] = 'degraded'

    # Verifica conexão com o Redis
    try:
        r = get_redis()
        r.ping()
        health_data['services']['redis'] = 'ok'
    except Exception as e:
        health_data['services']['redis'] = f'error: {str(e)}'
        health_data['status'] = 'degraded'

    # Define o código de status com base na saúde geral
    status_code = 200 if health_data['status'] == 'ok' else 503

    return jsonify(health_data), status_code


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)