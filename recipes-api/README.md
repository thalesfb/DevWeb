# Receitas API

Este projeto é um servidor web desenvolvido em Node.js e Express para gerenciar uma coleção de receitas culinárias. Ele oferece operações CRUD (Criar, Ler, Atualizar e Deletar) para gerenciar as receitas, e os dados são armazenados em memória.

## Funcionalidades

- **CRUD de Receitas**: Adicionar, listar, obter, atualizar e remover receitas.
- **Armazenamento em Memória**: As receitas são armazenadas em uma lista em memória.
- **Respostas em JSON**: Todas as respostas da API estão no formato JSON.
- **Pesquisa Avançada**: Pesquisar receitas por ingrediente ou tipo de prato.
- **Variáveis de Ambiente**: Usa a biblioteca Dotenv para gerenciar variáveis de ambiente.

## Como Executar o Projeto

### Pré-requisitos

- **Node.js** (v12 ou superior)
- **npm** (gerenciador de pacotes do Node.js)

### Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/receitas-api.git
   ```

2. Navegue até o diretório do projeto:

   ```bash
   cd receitas-api
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Crie um arquivo `.env` na raiz do projeto com a porta desejada:

   ```bash
   echo "PORT=3000" > .env
   ```

### Execução

Para iniciar o servidor, execute:

```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`.

## Endpoints da API

### Listar todas as receitas

- **URL**: `/recipes`
- **Método**: `GET`
- **Descrição**: Retorna todas as receitas.

### Obter uma receita específica

- **URL**: `/recipes/:id`
- **Método**: `GET`
- **Parâmetros**: `id` - ID da receita
- **Descrição**: Retorna uma receita específica pelo ID.

### Adicionar uma nova receita

- **URL**: `/recipes`
- **Método**: `POST`
- **Body (JSON)**:
  ```json
  {
    "name": "Bolo de Chocolate",
    "ingredients": ["farinha", "açúcar", "chocolate em pó"],
    "type": "sobremesa"
  }
  ```
- **Descrição**: Adiciona uma nova receita.

### Atualizar uma receita existente

- **URL**: `/recipes/:id`
- **Método**: `PUT`
- **Parâmetros**: `id` - ID da receita
- **Body (JSON)**:
  ```json
  {
    "name": "Bolo de Cenoura",
    "ingredients": ["farinha", "açúcar", "cenoura"],
    "type": "sobremesa"
  }
  ```
- **Descrição**: Atualiza uma receita existente.

### Remover uma receita

- **URL**: `/recipes/:id`
- **Método**: `DELETE`
- **Parâmetros**: `id` - ID da receita
- **Descrição**: Remove uma receita.

### Pesquisar receitas

- **URL**: `/recipes/search`
- **Método**: `GET`
- **Parâmetros de Query**:
  - `ingredient` - (Opcional) Ingrediente para filtrar as receitas.
  - `type` - (Opcional) Tipo de prato para filtrar as receitas.
- **Descrição**: Permite buscar receitas por ingredientes ou tipo de prato.

## Exemplos de Uso

- **Listar todas as receitas**: `GET http://localhost:3000/recipes`
- **Obter uma receita específica**: `GET http://localhost:3000/recipes/1`
- **Adicionar uma receita**:
  ```bash
  curl -X POST http://localhost:3000/recipes -H "Content-Type: application/json" -d '{"name": "Sopa de Legumes", "ingredients": ["batata", "cenoura", "abobrinha"], "type": "prato principal"}'
  ```
- **Atualizar uma receita**:
  ```bash
  curl -X PUT http://localhost:3000/recipes/1 -H "Content-Type: application/json" -d '{"name": "Bolo de Cenoura", "ingredients": ["farinha", "açúcar", "cenoura"], "type": "sobremesa"}'
  ```
- **Remover uma receita**: `DELETE http://localhost:3000/recipes/1`

## Tecnologias Utilizadas

- **Node.js**
- **Express**
- **Dotenv** para variáveis de ambiente

## Contribuição

Sinta-se à vontade para abrir issues e pull requests para melhorias.

## Licença

Este projeto está licenciado sob a licença MIT.

---

## Considerações Finais

Este projeto é uma implementação simples para fins educacionais. Como as receitas são armazenadas apenas em memória, todos os dados serão perdidos ao reiniciar o servidor. Em um ambiente de produção, seria necessário integrar com um banco de dados para persistir os dados.