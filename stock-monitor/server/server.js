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

// Endpoint para atualizar estoque (simulação de vendas)
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