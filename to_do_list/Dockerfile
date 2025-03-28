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