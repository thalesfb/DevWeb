# 🛠 **Atividade Prática: Criando um Sistema de To-Do List Monolítico**

## 📌 **Objetivo:**

Criar um sistema de lista de tarefas completo usando arquitetura moderna, com funcionalidades de **adicionar, editar, excluir, marcar como concluído** e recursos avançados como **cache, estatísticas e escalabilidade**.

## 🚀 **Metodologia:**

Este tutorial segue uma metodologia de aprendizado progressivo, começando com conceitos básicos e avançando para implementações de nível profissional:

<!-- referencia para as fases -->
1. **Fase 1:** [Sistema monolítico básico](#fase-1-sistema-monolítico-básico)
2. **Fase 2:** [Banco de dados PostgreSQL](#fase-2-banco-de-dados-postgresql)
3. **Fase 3:** [Cache e estatísticas com Redis](#fase-3-cache-e-estatísticas-com-redis)
4. **Fase 4:** [Escalabilidade e balanceamento com Nginx](#fase-4-escalabilidade-e-balanceamento-com-nginx)
5. **Fase 5:** [Conteinerização com Docker](#fase-5-conteinerização-com-docker)
6. **Fase 6:** [Exercícios práticos](#fase-6-exercícios-práticos)

## 👨‍💻 **Tecnologias Utilizadas:**

- **Backend:** Python com Flask
- **Frontend:** HTML, CSS
- **Banco de Dados:** PostgreSQL
- **Cache:** Redis
- **Servidor Web:** Gunicorn, Nginx
- **Contêinerização:** Docker, Docker Compose

---

# **FASE 1: SISTEMA MONOLÍTICO BÁSICO**

## **📌 Passo 1: Configurar o Ambiente**

Antes de começar, verifique se você tem o **Python** instalado:

```sh
python --version
```

Se não estiver instalado, baixe em: [https://www.python.org/downloads/](https://www.python.org/downloads/).

Crie um **ambiente virtual** para o projeto:

```sh
# Criar um ambiente virtual
python -m venv .venv

# Ativar o ambiente virtual (Windows)
.venv\Scripts\activate

# Ativar o ambiente virtual (Linux/Mac)
source .venv/bin/activate
```

## **📌 Passo 2: Instalar as Dependências**

Dentro do ambiente virtual, instale as dependências necessárias:

```sh
pip install flask gunicorn psycopg2-binary redis
```

Salve as dependências em um arquivo `requirements.txt`:

```sh
pip freeze > requirements.txt
```

## **📌 Passo 3: Criar a Estrutura do Projeto**

Organize seu projeto seguindo uma estrutura modular:

```
/todolist
  /templates
    index.html
  app.py
  requirements.txt
  docker-compose.yml
  Dockerfile
  /data
    init_postgres.sql
```

## **📌 Passo 4: Criar a Aplicação Flask Básica**

Crie o arquivo `app.py` com o seguinte código:

```python
from flask import Flask, render_template, request, redirect, jsonify
import socket
import os
import logging
import psycopg2
from psycopg2.extras import DictCursor

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.before_request
def log_request_info():
    hostname = socket.gethostname()
    port = os.environ.get('PORT', '5000')
    logger.info(f"Requisição recebida em {hostname} na porta {port}")

def connect_db():
    database_url = os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres@db:5432/todolist')
    conn = psycopg2.connect(database_url)
    conn.autocommit = True
    return conn

@app.route('/oi')
def hello():
    hostname = socket.gethostname()
    port = os.environ.get('PORT', '5000')
    return f"Hello from {hostname} on port {port}!\n"

@app.route('/')
def index():
    conn = connect_db()
    cur = conn.cursor(cursor_factory=DictCursor)
    cur.execute("SELECT * FROM tasks")
    tasks = cur.fetchall()
    conn.close()
    return render_template("index.html", tasks=tasks)

@app.route('/add', methods=['POST'])
def add_task():
    task = request.form['task']
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("INSERT INTO tasks (task, completed) VALUES (%s, %s)", (task, 0))
    conn.close()
    return redirect('/')

@app.route('/delete/<int:id>')
def delete_task(id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM tasks WHERE id=%s", (id,))
    conn.close()
    return redirect('/')

@app.route('/complete/<int:id>')
def complete_task(id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("UPDATE tasks SET completed = 1 WHERE id=%s", (id,))
    conn.close()
    return redirect('/')

if __name__ == "__main__":
    app.run(debug=True)
```

## **📌 Passo 5: Criar o Frontend**

Crie a pasta `templates` e dentro dela um arquivo `index.html`:

```html
<!DOCTYPE html>
<html lang="pt">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lista de Tarefas</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        max-width: 500px;
        margin: auto;
        text-align: center;
      }
      ul {
        list-style: none;
        padding: 0;
      }
      li {
        padding: 10px;
        border: 1px solid #ddd;
        margin: 5px 0;
        display: flex;
        justify-content: space-between;
      }
      .completed {
        text-decoration: line-through;
        color: gray;
      }
    </style>
  </head>
  <body>
    <h1>Lista de Tarefas</h1>
    <form action="/add" method="POST">
      <input type="text" name="task" required />
      <button type="submit">Adicionar</button>
    </form>
    <ul>
      {% for task in tasks %}
      <li class="{% if task['completed'] == 1 %}completed{% endif %}">
        {{ task['task'] }}
        <div>
          <a href="/complete/{{ task['id'] }}">✔️</a>
          <a href="/delete/{{ task['id'] }}">❌</a>
        </div>
      </li>
      {% endfor %}
    </ul>
  </body>
</html>
```

---

# **FASE 2: BANCO DE DADOS POSTGRESQL**

## **📌 Passo 6: Criar o Script de Inicialização do PostgreSQL**

Crie uma pasta `data` e dentro dela o arquivo `init_postgres.sql`:

```sql
-- Cria a tabela tasks se ela não existir
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    task TEXT NOT NULL,
    completed INTEGER DEFAULT 0
);

-- Cria índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);

-- Função para verificar se a tabela está vazia
CREATE OR REPLACE FUNCTION is_table_empty(table_name text)
RETURNS boolean AS $$
DECLARE
    row_count integer;
BEGIN
    EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO row_count;
    RETURN row_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Insere tarefas de exemplo apenas se a tabela estiver vazia
DO $$
BEGIN
    IF (SELECT is_table_empty('tasks')) THEN
        INSERT INTO tasks (task, completed) VALUES
            ('Estudar Docker', 0),
            ('Aprender sobre PostgreSQL', 0),
            ('Configurar Nginx', 1),
            ('Implementar Redis Cache', 0),
            ('Otimizar configuração Gunicorn', 0);
    END IF;
END $$;

-- Log de inicialização
DO $$
BEGIN
    RAISE NOTICE 'Banco de dados inicializado com sucesso!';
END $$;
```

## **📌 Passo 7: Criar Arquivos de Configuração Docker**

### **Arquivo Dockerfile:**

```dockerfile
# Usa a versão leve do Python (Slim)
FROM python:3.10-slim
# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Instala as dependências necessárias
RUN apt update && apt install -y net-tools bash libpq-dev gcc curl

# Copia apenas o requirements.txt primeiro (para aproveitar o cache do Docker)
COPY requirements.txt .

# Atualizar pip
RUN python -m pip install --upgrade pip

# Instala as dependências necessárias (usa --no-cache para evitar arquivos desnecessários)
RUN pip install --no-cache-dir -r requirements.txt

# Copia apenas os arquivos necessários para a aplicação
COPY app.py .
COPY templates/ templates/

# Comando para iniciar a aplicação usando Gunicorn diretamente
CMD ["sh", "-c", "gunicorn --workers 3 --bind 0.0.0.0:${PORT:-5000} app:app"]
```

### **Arquivo docker-compose.yml básico:**

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: app
    environment:
      - PORT=5000
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/todolist
    ports:
      - '5000:5000'
    depends_on:
      db:
        condition: service_healthy
    restart: always

  db:
    image: postgres:14-alpine
    container_name: db
    restart: always
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=todolist
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./data/init_postgres.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - '5432:5432'
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local
```

---

# **FASE 3: CACHE E ESTATÍSTICAS COM REDIS**

## **📌 Passo 8: Implementar Redis para Cache e Estatísticas**

Atualize o arquivo `app.py` para incluir funcionalidades de cache e estatísticas:

```python
# Adicione no início do arquivo, após os imports existentes
import redis
import json
import time

# Adicione esta função após os imports
def get_redis():
    redis_url = os.environ.get('REDIS_URL', 'redis://redis:6379/0')
    return redis.from_url(redis_url)

# Atualize a função before_request
@app.before_request
def log_request_info():
    hostname = socket.gethostname()
    port = os.environ.get('PORT', '5000')
    logger.info(f"Requisição recebida em {hostname} na porta {port}")

    # Incrementa contador de acessos no Redis
    try:
        r = get_redis()
        r.incr('access_count')
        r.hincrby('access_by_path', request.path, 1)
    except Exception as e:
        logger.error(f"Erro ao registrar acesso no Redis: {str(e)}")

# Atualize a função index com cache
@app.route('/')
def index():
    # Tenta obter dados do cache
    try:
        r = get_redis()
        cached_tasks = r.get('tasks_list')

        if cached_tasks:
            logger.info("Servindo tarefas do cache")
            tasks = json.loads(cached_tasks)
        else:
            logger.info("Buscando tarefas do banco de dados")
            conn = connect_db()
            cur = conn.cursor(cursor_factory=DictCursor)
            cur.execute("SELECT * FROM tasks")
            tasks = [dict(task) for task in cur.fetchall()]
            conn.close()

            # Armazena em cache por 30 segundos
            r.setex('tasks_list', 30, json.dumps(tasks))
    except Exception as e:
        logger.error(f"Erro com Redis: {str(e)}")
        # Fallback para banco de dados
        conn = connect_db()
        cur = conn.cursor(cursor_factory=DictCursor)
        cur.execute("SELECT * FROM tasks")
        tasks = [dict(task) for task in cur.fetchall()]
        conn.close()

    return render_template("index.html", tasks=tasks)

# Adicione esta nova rota para estatísticas
@app.route('/stats')
def stats():
    try:
        r = get_redis()
        access_count = int(r.get('access_count') or 0)
        access_by_path = {k.decode(): int(v) for k, v in r.hgetall('access_by_path').items()}

        # Coleta tempos de resposta
        response_times = r.lrange('response_times', 0, -1)
        avg_response_time = 0
        if response_times:
            avg_response_time = sum(float(t) for t in response_times) / len(response_times)

        stats_data = {
            'total_accesses': access_count,
            'by_path': access_by_path,
            'avg_response_time_ms': round(avg_response_time * 1000, 2)
        }
        return jsonify(stats_data)
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Implemente middleware para registrar tempo de resposta
@app.after_request
def after_request(response):
    try:
        request_time = request.environ.get('REQUEST_TIME')
        if request_time:
            elapsed = time.time() - request_time
            r = get_redis()
            r.lpush('response_times', elapsed)
            r.ltrim('response_times', 0, 99)  # Mantém apenas os 100 últimos
    except Exception as e:
        logger.error(f"Erro ao registrar tempo de resposta: {str(e)}")
    return response

# Middleware para iniciar o timer de requisição
@app.before_request
def start_timer():
    request.environ['REQUEST_TIME'] = time.time()
```

## **📌 Passo 9: Atualizar o docker-compose.yml para incluir Redis**

Adicione o serviço Redis ao arquivo `docker-compose.yml`:

```yaml
services:
  # Serviços existentes (app, db)...

  redis:
    image: redis:7-alpine
    container_name: redis
    restart: always
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
```

---

# **FASE 4: ESCALABILIDADE E BALANCEAMENTO COM NGINX**

## **📌 Passo 10: Implementar Escalabilidade Horizontal**

Atualize o `docker-compose.yml` para ter múltiplas instâncias da aplicação:

```yaml
services:
  app1:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: app1
    environment:
      - PORT=5000
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/todolist
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - ./data:/app/data
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: always
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:5000/oi']
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s

  app2:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: app2
    environment:
      - PORT=5001
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/todolist
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - ./data:/app/data
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: always
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:5001/oi']
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s

  # Servidor de backup para alta disponibilidade
  app3:
    image: busybox:latest
    container_name: app3
    volumes:
      - ./backup:/var/www
    command: ['httpd', '-f', '-p', '3000', '-h', '/var/www']

  # Configuração de Nginx para balanceamento de carga
  nginx:
    image: nginx:latest
    container_name: nginx
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - '80:80'
    depends_on:
      app1:
        condition: service_healthy
      app2:
        condition: service_healthy
      app3:
        condition: service_started
    restart: always
```

## **📌 Passo 11: Configurar o Nginx para Balanceamento de Carga**

Crie uma pasta `nginx` e dentro dela um arquivo `nginx.conf`:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    keepalive_timeout 65;

    upstream flask_app {
        server app1:5000 max_fails=3 fail_timeout=30s;
        server app2:5001 max_fails=3 fail_timeout=30s;
        server app3:3000 backup;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            proxy_pass http://flask_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 10;
            proxy_send_timeout 10;
            proxy_read_timeout 10;
            client_max_body_size 10M;
        }
    }
}
```

## **📌 Passo 12: Configurar Arquivos de Backup**

Crie uma pasta `backup` e dentro dela um arquivo HTML básico para caso todos os servidores principais falhem:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Serviço em Manutenção</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 50px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 5px;
      }
      h1 {
        color: #e74c3c;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Serviço em Manutenção</h1>
      <p>
        Nossos servidores estão passando por manutenção. Por favor, tente novamente em alguns
        instantes.
      </p>
    </div>
  </body>
</html>
```

---

# **FASE 5: MONITORAMENTO E TESTES DE CARGA**

## **📌 Passo 13: Adicionar Monitoramento Básico**

Crie uma rota `/health` para verificar a saúde do sistema:

```python
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
```

## **📌 Passo 14: Executar e Testar a Aplicação**

Construa e inicie os containers com Docker Compose:

```sh
docker compose up -d --build
```

Acesse a aplicação:

- Acesse a aplicação em `http://localhost`
- Veja as estatísticas em `http://localhost/stats`
- Verifique a saúde do sistema em `http://localhost/health`

Teste o balanceamento de carga:

```sh
for i in {1..10}; do curl http://localhost/oi; done
```

Teste a alta disponibilidade:

```sh
# Pare os servidores principais
docker compose stop app1
docker compose stop app2

# Verifique se o servidor de backup está respondendo
curl http://localhost
```

---

# **FASE 6: EXERCÍCIOS PRÁTICOS**

1. **Implementar Autenticação**

   - Adicione um sistema de login para proteger a lista de tarefas
   - Use Flask-Login e estruture o código de forma modular

2. **Adicionar Categorias para Tarefas**

   - Modifique o banco de dados para incluir categorias
   - Atualize a interface para filtrar por categoria

3. **Implementar API REST Completa**

   - Crie endpoints RESTful seguindo as melhores práticas
   - Documente a API usando Swagger/OpenAPI

4. **Integrar com Ferramenta de Monitoramento**
   - Configure Prometheus para coletar métricas
   - Crie um dashboard Grafana para visualizar métricas

---

# **CONCLUSÃO**

Este tutorial demonstrou como construir uma aplicação moderna e escalável usando as melhores práticas de desenvolvimento. Ao seguir esta abordagem, você criou um sistema que:

1. **É altamente escalável** - tanto vertical quanto horizontalmente
2. **Tem alta disponibilidade** - com balanceamento de carga e servidor de backup
3. **É performático** - com cache, índices e configurações otimizadas
4. **É monitorável** - com métricas, logs e endpoints de saúde
5. **Segue boas práticas DevOps** - usando containerização e configuração declarativa

Para aprendizado adicional, explore conceitos de CI/CD, Infrastructure as Code, e arquiteturas de microsserviços.
