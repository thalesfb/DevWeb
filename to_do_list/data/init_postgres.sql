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

-- Cria tabela para estatísticas caso seja necessário
CREATE TABLE IF NOT EXISTS stats (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Log de inicialização
DO $$
BEGIN
    RAISE NOTICE 'Banco de dados inicializado com sucesso!';
END $$; 