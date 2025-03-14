# TodoListDockerAula

## Descrição do Projeto

Este projeto é uma aplicação de lista de tarefas (To-Do List) desenvolvida como um sistema monolítico com recursos avançados de escalabilidade e performance. A aplicação permite aos usuários criar, editar, excluir e marcar tarefas como concluídas, oferecendo uma interface simples e funcional, além de recursos de estatísticas e cache.

## Arquitetura

O sistema utiliza uma arquitetura escalonável baseada em contêineres Docker com balanceamento de carga:

- **Frontend e Backend**: Aplicação Flask monolítica que serve tanto o frontend quanto o backend
- **Banco de Dados**: PostgreSQL para armazenamento persistente
- **Cache**: Redis para armazenamento em memória e estatísticas
- **Escalabilidade**: Múltiplas instâncias da aplicação rodando simultaneamente
- **Balanceador de Carga**: Nginx para distribuir requisições entre as instâncias
- **Servidor de Backup**: Instância BusyBox para garantir alta disponibilidade

## Tecnologias Utilizadas

- **Backend**: Python com Flask
- **Frontend**: HTML, CSS e JavaScript
- **Banco de Dados Principal**: PostgreSQL
- **Cache e Estatísticas**: Redis
- **Servidor WSGI**: Gunicorn
- **Contêinerização**: Docker e Docker Compose
- **Balanceamento de Carga**: Nginx
- **Servidor de Backup**: BusyBox

## Como Executar o Projeto

### Pré-requisitos

- Docker e Docker Compose instalados
- Git

### Passos para Execução

1. Clone o repositório:
   ```bash
   git clone [URL_DO_REPOSITÓRIO]
   cd todolist
   ```

2. Execute a aplicação com Docker Compose:
   ```bash
   docker compose up -d --build
   ```

3. Acesse a aplicação:
   - HTTP: http://localhost
   - HTTPS: https://localhost (aceite o certificado autoassinado)

### Comandos Úteis

- Visualizar logs:
  ```bash
  docker compose logs -f app1
  docker compose logs -f app2
  docker compose logs -f postgres
  docker compose logs -f redis
  docker compose logs -f nginx
  ```

- Parar a aplicação:
  ```bash
  docker compose down
  ```

- Testar balanceamento de carga:
  ```bash
  for i in {1..10}; do curl -k https://localhost/oi; done
  ```

- Testar servidor de backup:
  ```bash
  docker compose stop app1
  docker compose stop app2
  # A aplicação continuará disponível através do servidor backup
  ```

## Funcionalidades

- **Adicionar tarefas**: Inserir novas tarefas na lista
- **Marcar como concluída**: Marcar tarefas já finalizadas
- **Excluir tarefas**: Remover tarefas da lista
- **Visualizar tarefas**: Lista completa de todas as tarefas cadastradas
- **Estatísticas**: Visualização de métricas de uso do sistema
- **Cache**: Respostas mais rápidas através de armazenamento em memória

## Estrutura de Escalabilidade

A aplicação implementa dois tipos de escalabilidade:

1. **Escalabilidade Vertical**: Através do Gunicorn com múltiplos workers
2. **Escalabilidade Horizontal**: Múltiplas instâncias da aplicação (app1, app2) com balanceamento de carga

O sistema também implementa alta disponibilidade através de:

- Servidor de backup (app3 com BusyBox)
- Tolerância a falhas no Nginx (max_fails=3, fail_timeout=30s)
- Banco de dados PostgreSQL para persistência confiável
- Redis para cache e melhoria de performance
- Certificados SSL autogerados para HTTPS

## Estrutura de Diretórios

- **todolist_postgres_data**: Volume Docker para dados do PostgreSQL
- **todolist_redis_data**: Volume Docker para dados do Redis
- **/backup**: Contém arquivos para o servidor de backup
- **/nginx**: Configuração do balanceador de carga
- **/certs**: Certificados SSL autoassinados
- **/templates**: Templates HTML da aplicação

## Banco de Dados PostgreSQL

O projeto utiliza PostgreSQL como sistema de banco de dados principal, oferecendo:
- Persistência robusta de dados
- Suporte a consultas complexas
- Escalabilidade para grandes volumes de dados
- Backup e recuperação confiáveis

## Redis para Cache e Estatísticas

A integração com Redis proporciona:
- Cache de operações frequentes, reduzindo carga no banco de dados
- Armazenamento de estatísticas de uso em tempo real
- Melhor tempo de resposta para consultas repetidas
- Monitoramento de performance do sistema

## Monitoramento e Manutenção

Para monitorar os containers em execução:
```bash
docker stats
docker compose ps
```

Para forçar a recriação de um serviço:
```bash
docker compose up -d --force-recreate [serviço]
```

## Limpeza do Ambiente

Para limpar completamente o ambiente:
```bash
docker compose down
docker system prune -a
```
