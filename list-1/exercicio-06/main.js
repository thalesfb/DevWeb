// Carrega os produtos ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts(); // Carrega os produtos
    initializeEventListeners(); // Inicializa os ouvintes de eventos
    updateCartCount(); // Atualiza a contagem de itens no carrinho
});

// Função para buscar os produtos
function fetchProducts() {
    fetch('products.json') // Faz a requisição para o arquivo JSON contendo os produtos
        .then(response => response.json()) // Converte a resposta para JSON
        .then(data => {
            window.products = data; // Armazena os produtos em uma variável global
            displayProducts(data); // Exibe os produtos na página
            populateFilters(data); // Popula os filtros de categoria e marca
        });
}

// Função para exibir os produtos na página
function displayProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = ''; // Limpa a lista de produtos

    // Verifica se existem produtos disponíveis
    if (products.length === 0) {
        productList.innerHTML = '<p>Nenhum produto encontrado.</p>'; // Exibe mensagem caso não haja produtos
        return;
    }

    // Cria e adiciona cada produto ao elemento da lista de produtos
    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';

        productItem.innerHTML = `
            <img src="assets/images/${product.images[0]}" alt="${product.name}" />
            <h2>${product.name}</h2>
            <p>${product.description}</p>
            <p><strong>R$ ${product.price.toFixed(2)}</strong></p>
            <button onclick="addToCart(${product.id})" aria-label="Adicionar ${product.name} ao carrinho">Adicionar ao Carrinho</button>
            <button onclick="viewProductDetails(${product.id})" aria-label="Ver detalhes de ${product.name}">Ver Detalhes</button>
        `;
        productList.appendChild(productItem); // Adiciona o produto à lista de produtos
    });
}

// Função para popular os filtros de categoria e marca
function populateFilters(products) {
    const categoryFilter = document.getElementById('category-filter');
    const brandFilter = document.getElementById('brand-filter');

    // Obtém categorias e marcas únicas usando Set
    const categories = [...new Set(products.map(p => p.category))];
    const brands = [...new Set(products.map(p => p.brand))];

    // Popula o filtro de categorias
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Popula o filtro de marcas
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });
}

// Inicializa os ouvintes de eventos da página
function initializeEventListeners() {
    // Ouvintes para pesquisa e filtros
    document.getElementById('search-bar').addEventListener('input', handleSearchAndFilter);
    document.getElementById('category-filter').addEventListener('change', handleSearchAndFilter);
    document.getElementById('brand-filter').addEventListener('change', handleSearchAndFilter);

    // Ouvinte para abrir o modal do carrinho
    document.getElementById('cart-link').addEventListener('click', (e) => {
        e.preventDefault();
        openModal('cart-modal');
        displayCartItems(); // Exibe os itens do carrinho ao abrir o modal
    });

    // Ouvintes para fechar os modais
    document.getElementById('close-cart-modal').addEventListener('click', () => {
        closeModal('cart-modal');
    });
    document.getElementById('close-product-modal').addEventListener('click', () => {
        closeModal('product-modal');
    });
    document.getElementById('close-checkout-modal').addEventListener('click', () => {
        closeModal('checkout-modal');
    });

    // Ouvinte para abrir o modal de checkout
    document.getElementById('checkout-button').addEventListener('click', (e) => {
        e.preventDefault();
        openModal('checkout-modal');
        document.getElementById('confirm-checkout-button').onclick = handleCheckout;
        document.getElementById('cancel-checkout-button').onclick = () => closeModal('confirm-checkout-modal');
    });

    // Ouvinte para submissão do formulário de checkout
    document.getElementById('checkout-form').addEventListener('submit', handleCheckout);

    // Acessibilidade: Fechar modais com a tecla ESC
    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal.show');
            openModals.forEach(modal => {
                closeModal(modal.id);
            });
        }
    });
}

// Função para lidar com a pesquisa e os filtros
function handleSearchAndFilter() {
    const query = document.getElementById('search-bar').value.toLowerCase(); // Obtém o valor da barra de pesquisa
    const category = document.getElementById('category-filter').value; // Obtém a categoria selecionada
    const brand = document.getElementById('brand-filter').value; // Obtém a marca selecionada

    let filteredProducts = window.products; // Começa com todos os produtos

    // Filtra por nome se houver uma busca
    if (query) {
        filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(query));
    }

    // Filtra por categoria se uma categoria estiver selecionada
    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    // Filtra por marca se uma marca estiver selecionada
    if (brand) {
        filteredProducts = filteredProducts.filter(p => p.brand === brand);
    }

    displayProducts(filteredProducts); // Exibe os produtos filtrados
}

// Função para adicionar produto ao carrinho
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || []; // Obtém o carrinho atual ou inicializa vazio

    const product = window.products.find(p => p.id === productId); // Encontra o produto pelo ID
    const existingProduct = cart.find(p => p.id === productId); // Verifica se o produto já está no carrinho

    if (existingProduct) {
        existingProduct.quantity += 1; // Se o produto já está no carrinho, incrementa a quantidade
    } else {
        cart.push({ ...product, quantity: 1 }); // Se não estiver no carrinho, adiciona com quantidade 1
    }

    localStorage.setItem('cart', JSON.stringify(cart)); // Atualiza o carrinho no localStorage
    updateCartCount(); // Atualiza a contagem de itens no carrinho

    alert('Produto adicionado ao carrinho!');
}

// Atualiza a contagem de itens no carrinho
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || []; // Obtém o carrinho atual ou inicializa vazio
    const cartCount = cart.reduce((total, product) => total + product.quantity, 0); // Calcula a quantidade total de itens
    document.getElementById('cart-count').textContent = cartCount; // Atualiza o elemento de contagem de itens no carrinho
}

// Função para exibir os itens do carrinho
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    let cart = JSON.parse(localStorage.getItem('cart')) || []; // Obtém o carrinho atual ou inicializa vazio
    cartItemsContainer.innerHTML = ''; // Limpa os itens do carrinho

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>'; // Exibe mensagem se o carrinho estiver vazio
        document.getElementById('cart-total').textContent = 'Total: R$ 0,00';
        return;
    }

    let total = 0;

    // Cria um item do carrinho para cada produto
    cart.forEach(product => {
        total += product.price * product.quantity; // Atualiza o valor total do carrinho
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <p>${product.name}</p>
            <input type="number" value="${product.quantity}" min="1" aria-label="Quantidade de ${product.name}" onchange="updateQuantity(${product.id}, this.value)">
            <p>R$ ${(product.price * product.quantity).toFixed(2)}</p>
            <button aria-label="Remover ${product.name}" onclick="confirmRemoveProduct(${product.id})">Remover</button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    // Atualiza o valor total no elemento de total do carrinho
    document.getElementById('cart-total').textContent = `Total: R$ ${total.toFixed(2)}`;
}

// Função para confirmar remoção do produto
function confirmRemoveProduct(productId) {
    openModal('confirm-remove-modal'); // Abre o modal de confirmação
    document.getElementById('confirm-remove-button').onclick = () => {
        removeFromCart(productId); // Remove o produto se confirmado
        closeModal('confirm-remove-modal'); // Fecha o modal de confirmação
    };
    document.getElementById('cancel-remove-button').onclick = () => closeModal('confirm-remove-modal'); // Fecha o modal se cancelado
}

// Função para atualizar a quantidade de um produto no carrinho
function updateQuantity(productId, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = cart.find(p => p.id === productId);
    if (product && newQuantity > 0) {
        product.quantity = parseInt(newQuantity, 10); // Atualiza a quantidade do produto
        localStorage.setItem('cart', JSON.stringify(cart)); // Atualiza o carrinho no localStorage
        displayCartItems(); // Atualiza os itens do carrinho
        updateCartCount(); // Atualiza a contagem de itens no carrinho
    }
}

// Função para remover item do carrinho
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || []; // Obtém o carrinho atual ou inicializa vazio
    cart = cart.filter(p => p.id !== productId); // Remove o produto do carrinho
    localStorage.setItem('cart', JSON.stringify(cart)); // Atualiza o carrinho no localStorage
    updateCartCount(); // Atualiza a contagem de itens no carrinho
    displayCartItems(); // Atualiza a exibição dos itens do carrinho
}

// Função para visualizar detalhes do produto
function viewProductDetails(productId) {
    const product = window.products.find(p => p.id === productId); // Encontra o produto pelo ID

    const productDetailsContainer = document.getElementById('product-details');
    productDetailsContainer.innerHTML = `
        <h2>${product.name}</h2>
        <div class="product-image-container">
            <img src="assets/images/${product.images[0]}" alt="${product.name}" />
        </div>
        <p>${product.description}</p>
        <p><strong>R$ ${product.price.toFixed(2)}</strong></p>
        <button onclick="addToCart(${product.id})" aria-label="Adicionar ${product.name} ao carrinho">Adicionar ao Carrinho</button>
    `;

    openModal('product-modal'); // Abre o modal de detalhes do produto
}

// Função para abrir um modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show'); // Adiciona a classe para exibir o modal
    modal.setAttribute('aria-hidden', 'false'); // Atualiza o atributo de acessibilidade
    // Gerenciar o foco para acessibilidade
    const focusableElements = modal.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length) focusableElements[0].focus(); // Foca no primeiro elemento focável do modal
}

// Função para fechar um modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show'); // Remove a classe para esconder o modal
    modal.setAttribute('aria-hidden', 'true'); // Atualiza o atributo de acessibilidade
}

// Função para lidar com o checkout
function handleCheckout(event) {
    event.preventDefault(); // Previne o comportamento padrão do formulário

    // Validação dos campos do formulário
    const name = document.getElementById('name').value.trim();
    const address = document.getElementById('address').value.trim();
    const payment = document.getElementById('payment').value;

    if (!name || !address || !payment) {
        alert('Por favor, preencha todos os campos obrigatórios.'); // Exibe alerta se houver campos obrigatórios vazios
        return;
    }

    // Limpa o carrinho e atualiza a contagem
    localStorage.removeItem('cart'); // Remove o carrinho do localStorage
    updateCartCount(); // Atualiza a contagem de itens no carrinho
    displayCartItems(); // Atualiza a exibição dos itens do carrinho

    alert('Compra finalizada com sucesso!'); // Exibe mensagem de sucesso
    closeModal('checkout-modal'); // Fecha o modal de checkout
    closeModal('cart-modal'); // Fecha o modal do carrinho
}
