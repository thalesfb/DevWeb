# Stock Monitor

Aplicação de monitoramento de estoque em tempo real que demonstra três diferentes abordagens para atualizações ao vivo: HTTP Polling, WebSocket e Server-Sent Events (SSE).

## 🚀 Funcionalidades

### Monitoramento em Tempo Real
A aplicação fornece três formas simultâneas de monitorar atualizações:

1. **HTTP Polling**
   - Busca dados do estoque a cada 5 segundos
   - Compatível com todos os navegadores
   - Usa requisições HTTP GET padrão para `/api/products`

2. **WebSocket**
   - Fornece atualizações instantâneas através de conexão persistente
   - Comunicação bidirecional
   - Reconexão automática em caso de perda (intervalo de 5 segundos)

3. **Server-Sent Events (SSE)**
   - Atualizações enviadas pelo servidor em tempo real
   - Comunicação eficiente unidirecional
   - Reconexão automática em caso de perda
   - Inclui tipos de mensagem para conexão inicial e atualizações

### Gestão de Produtos
- Visualização de níveis de estoque em tempo real
- Indicação visual para itens com baixo estoque (menos de 5 unidades)
- Exibição de timestamp para cada atualização
- Interface para simulação de atualizações de estoque

## 🛠 Stack Técnica

### Frontend
- JavaScript puro (Sem dependências de frameworks)
- HTML5
- CSS3 com layout flexbox
- API WebSocket nativa
- API Server-Sent Events (EventSource)

### Backend
- Node.js
- Express.js
- WebSocket (pacote ws)
- CORS habilitado
- Servidor de arquivos estáticos

## ⚙️ Configuração

\`\`\`javascript
Frontend:
- Intervalo de Polling: 5 segundos
- URL da API: http://localhost:3000/api
- URL do WebSocket: ws://localhost:3000
- URL do SSE: http://localhost:3000/sse

Backend:
- Porta: 3000
- CORS: Habilitado
\`\`\`

## 📡 Endpoints da API

- \`GET /api/products\` - Obter níveis atuais de estoque
- \`POST /api/update-stock\` - Atualizar níveis de estoque
- \`GET /sse\` - Endpoint SSE para atualizações em tempo real
- Servidor WebSocket na porta 3000

## 📦 Dados de Exemplo

O sistema vem com produtos de exemplo:
\`\`\`javascript
{
    notebook: { id: 1, name: 'Notebook Dell', stock: 10 },
    monitor: { id: 2, name: 'Monitor LG', stock: 5 },
    keyboard: { id: 3, name: 'Teclado HyperX', stock: 15 }
}
\`\`\`

## 🚀 Instalação e Execução

1. Instalar dependências:
   \`\`\`bash
   cd server
   npm install
   \`\`\`

2. Iniciar o servidor:
   \`\`\`bash
   node server.js
   \`\`\`

3. Acessar a aplicação:
   - Abrir \`http://localhost:3000\` no navegador
   - Os arquivos estáticos são servidos automaticamente pelo Express

## 💻 Uso

### Visualizando Níveis de Estoque
- Os três métodos de monitoramento (Polling, WebSocket, SSE) funcionam simultaneamente
- Cada método exibe em seu próprio painel
- Produtos com estoque abaixo de 5 unidades são destacados
- Cada painel mostra seu próprio timestamp de última atualização

### Simulando Atualizações de Estoque
1. Use o painel de controle para simular atualizações
2. Selecione um produto do dropdown
3. Digite a quantidade a ser deduzida
4. Envie para ver atualizações em tempo real em todos os três métodos

### Tratamento de Erros
- Reconexão automática para WebSocket e SSE (5 segundos)
- Validação para estoque insuficiente
- Mensagens de erro para operações falhas
- Logging no console para debug

## 🌐 Compatibilidade com Navegadores

- HTTP Polling: Todos os navegadores
- WebSocket: Navegadores modernos
- SSE: Navegadores modernos (exceto IE)
- CSS: Navegadores modernos com suporte a flexbox

## 📁 Estrutura do Projeto

\`\`\`
stock-monitor/
├── public/
│   ├── index.html     # Interface do usuário
│   ├── style.css      # Estilos da aplicação
│   ├── reset.css      # Reset de estilos CSS
│   └── script.js      # Lógica do cliente
└── server/
    ├── package.json   # Dependências do projeto
    └── server.js      # Servidor Node.js
\`\`\`