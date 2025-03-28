// Configurações
const POLLING_INTERVAL = 5000; // 5 segundos
const API_URL = 'http://localhost:3000/api';
const SSE_URL = 'http://localhost:3000/sse';
const WS_URL = 'ws://localhost:3000';

// Elementos DOM
const pollingContent = document.getElementById('polling-content');
const websocketContent = document.getElementById('websocket-content');

// Função para formatar os produtos em HTML
function formatProducts(products, timestamp) {
    return Object.values(products).map(product => `
        <div class="product-item ${product.stock < 5 ? 'low-stock' : ''}">
            <strong>${product.name}</strong>
            <p>Estoque: ${product.stock} unidades</p>
        </div>
    `).join('') + `<div class="timestamp">Última atualização: ${timestamp}</div>`;
}

// Implementação do HTTP Polling
function startPolling() {
    async function fetchProducts() {
        try {
            const response = await fetch(`${API_URL}/products`);
            const products = await response.json();
            pollingContent.innerHTML = formatProducts(products, new Date().toLocaleTimeString());
        } catch (error) {
            console.error('Erro no polling:', error);
        }
    }

    // Primeira chamada imediata
    fetchProducts();
    
    // Configurar o intervalo de polling
    setInterval(fetchProducts, POLLING_INTERVAL);
}

// Implementação do WebSocket
function startWebSocket() {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
        console.log('Conexão WebSocket estabelecida');
    };

    ws.onmessage = (event) => {
        const products = JSON.parse(event.data);
        websocketContent.innerHTML = formatProducts(products, new Date().toLocaleTimeString());
    };

    ws.onclose = () => {
        console.log('Conexão WebSocket fechada');
        // Tentar reconectar após 5 segundos
        setTimeout(startWebSocket, 5000);
    };

    ws.onerror = (error) => {
        console.error('Erro no WebSocket:', error);
    };
}

// Implementação SSE

function startSSE() {
    const eventSource = new EventSource('/sse');

    eventSource.onopen = () => {
        console.log('Conexão SSE estabelecida');
    };

    eventSource.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            console.log('Mensagem SSE recebida:', message);

            if (message.type === 'connection' || message.type === 'update') {
                const products = message.data;
                const timestamp = new Date(message.timestamp).toLocaleTimeString();
                document.getElementById('sse-content').innerHTML = formatProducts(products, timestamp);
            }
        } catch (error) {
            console.error('Erro ao processar mensagem SSE:', error);
        }
    };

    eventSource.onerror = (error) => {
        console.error('Erro no EventSource:', error);
        eventSource.close();
        // Tentar reconectar após 5 segundos
        setTimeout(startSSE, 5000);
    };
}

// Função para simular uma venda
async function simulateOrder() {
    const productId = parseInt(document.getElementById('product').value);
    const quantity = parseInt(document.getElementById('quantity').value);

    try {
        const response = await fetch(`${API_URL}/update-stock`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity })
        });

        const result = await response.json();
        if (!result.success) {
            alert(result.message);
        }
    } catch (error) {
        console.error('Erro ao simular venda:', error);
        alert('Erro ao processar a venda');
    }
}

// Iniciar os monitores
startPolling();
startWebSocket();
startSSE();