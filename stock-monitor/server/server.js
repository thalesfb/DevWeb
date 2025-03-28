const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Configuração do servidor
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Dados do estoque (simulação)
let products = {
    notebook: { id: 1, name: 'Notebook Dell', stock: 10 },
    monitor: { id: 2, name: 'Monitor LG', stock: 5 },
    keyboard: { id: 3, name: 'Teclado HyperX', stock: 15 }
};

// Endpoint para HTTP Polling
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Adicionando suporte a SSE no servidor
let sseClients = [];

app.get('/sse', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Adiciona o cliente à lista de conexões SSE
    sseClients.push(res);

    // Envia uma mensagem inicial em formato JSON
    const initialMessage = {
        type: 'connection',
        timestamp: new Date().toISOString(),
        data: products
    };
    res.write(`data: ${JSON.stringify(initialMessage)}\n\n`);

    // Remove o cliente da lista ao encerrar a conexão
    req.on('close', () => {
        sseClients = sseClients.filter(client => client !== res);
    });
});

// Função para enviar atualizações SSE para todos os clientes conectados
function notifySSEClients(products) {
    const message = {
        type: 'update',
        timestamp: new Date().toISOString(),
        data: products
    };
    sseClients.forEach(client => {
        client.write(`data: ${JSON.stringify(message)}\n\n`);
    });
}

// Atualizando o endpoint para notificar clientes SSE
app.post('/api/update-stock', (req, res) => {
    const { productId, quantity } = req.body;
    const product = Object.values(products).find(p => p.id === productId);
    
    if (product && product.stock >= quantity) {
        product.stock -= quantity;
        // Notifica todos os clientes WebSocket
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(products));
            }
        });

        // Notifica todos os clientes SSE
        notifySSEClients(products);

        res.json({ success: true, products });
    } else {
        res.status(400).json({ success: false, message: 'Estoque insuficiente' });
    }
});

// Servidor HTTP
const server = app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

// Servidor WebSocket
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Novo cliente WebSocket conectado');
    // Envia dados iniciais
    ws.send(JSON.stringify(products));

    ws.on('close', () => {
        console.log('Cliente WebSocket desconectado');
    });
});