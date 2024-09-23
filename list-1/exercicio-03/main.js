// Seleção de elementos
const imageForm = document.getElementById('image-form'); // Seleciona o formulário de imagens pelo ID
const imagesSection = document.getElementById('images-section'); // Seleciona a seção onde as imagens serão exibidas pelo ID
const widthInput = document.getElementById('width'); // Seleciona o campo de entrada de largura pelo ID
const heightInput = document.getElementById('height'); // Seleciona o campo de entrada de altura pelo ID
const quantitySelect = document.getElementById('quantity'); // Seleciona o campo de seleção de quantidade pelo ID

// Eventos
imageForm.addEventListener('submit', fetchImages); // Adiciona um ouvinte de evento para o formulário que chama a função fetchImages ao ser submetido

/**
 * Fetches random images based on user input and displays them in the images section.
 * 
 * @param {Event} event - The event object from the form submission.
 * 
 * @description
 * This function prevents the default form submission behavior, validates the input fields for width, height, 
 * and quantity, and then fetches random images from the Picsum API. It displays a loading message while 
 * fetching the images and replaces it with the fetched images once they are loaded. Each image is displayed 
 * with options to download, copy the link, or share the image.
 * 
 * @throws Will display an alert if the width or height inputs are invalid.
 * @throws Will display an error message if there is an issue fetching the images.
 */
function fetchImages(event) {
    event.preventDefault(); // Previne o comportamento padrão de submissão do formulário

    // Validação dos campos
    const width = parseInt(widthInput.value); // Converte o valor do campo de largura para um número inteiro
    const height = parseInt(heightInput.value); // Converte o valor do campo de altura para um número inteiro
    const quantity = parseInt(quantitySelect.value); // Converte o valor do campo de quantidade para um número inteiro

    if (isNaN(width) || width <= 0) { // Verifica se a largura é um número válido e maior que zero
        alert('Por favor, insira uma largura válida.'); // Exibe um alerta se a largura for inválida
        return; // Sai da função se a largura for inválida
    }

    if (isNaN(height) || height <= 0) { // Verifica se a altura é um número válido e maior que zero
        alert('Por favor, insira uma altura válida.'); // Exibe um alerta se a altura for inválida
        return; // Sai da função se a altura for inválida
    }

    // Limpar seção de imagens
    imagesSection.innerHTML = ''; // Limpa o conteúdo da seção de imagens

    // Mostrar indicador de carregamento
    const loadingMessage = document.createElement('p'); // Cria um novo elemento de parágrafo
    loadingMessage.textContent = 'Carregando imagens...'; // Define o texto do parágrafo
    imagesSection.appendChild(loadingMessage); // Adiciona o parágrafo à seção de imagens

    // Criar um array de promessas para carregar as imagens
    const imagePromises = []; // Inicializa um array vazio para armazenar as promessas de carregamento de imagens

    for (let i = 0; i < quantity; i++) { // Loop para criar a quantidade de promessas especificada pelo usuário
        const imageUrl = `https://picsum.photos/${width}/${height}.webp?random=${Math.random()}`; // Gera uma URL para uma imagem aleatória com as dimensões especificadas

        // Usando fetch para verificar se a imagem está disponível
        imagePromises.push(fetch(imageUrl)); // Adiciona a promessa de fetch ao array de promessas
    }

    // Processar todas as promessas
    Promise.all(imagePromises) // Aguarda todas as promessas serem resolvidas
        .then((responses) => { // Quando todas as promessas são resolvidas
            imagesSection.innerHTML = ''; // Limpa o indicador de carregamento

            responses.forEach((response) => { // Para cada resposta de fetch
                const imageCard = document.createElement('div'); // Cria um novo elemento div para o cartão de imagem
                imageCard.classList.add('image-card'); // Adiciona a classe 'image-card' ao div

                const img = document.createElement('img'); // Cria um novo elemento de imagem
                img.src = response.url; // Define a URL da imagem
                img.alt = 'Imagem aleatória'; // Define o texto alternativo da imagem

                // Acessibilidade: Texto alternativo significativo
                img.alt = `Imagem aleatória de ${width}x${height} pixels`; // Define um texto alternativo mais descritivo

                const actionsDiv = document.createElement('div'); // Cria um novo elemento div para as ações da imagem
                actionsDiv.classList.add('image-actions'); // Adiciona a classe 'image-actions' ao div

                // Botão de Download
                const downloadButton = document.createElement('button'); // Cria um novo botão
                downloadButton.textContent = 'Baixar Full HD'; // Define o texto do botão
                downloadButton.addEventListener('click', () => { // Adiciona um ouvinte de evento de clique ao botão
                    downloadImage(response.url); // Chama a função downloadImage ao clicar no botão
                });

                // Botão Copiar Link
                const copyLinkButton = document.createElement('button'); // Cria um novo botão
                copyLinkButton.textContent = 'Copiar Link'; // Define o texto do botão
                copyLinkButton.addEventListener('click', () => { // Adiciona um ouvinte de evento de clique ao botão
                    copyLink(response.url); // Chama a função copyLink ao clicar no botão
                });

                // Botão Compartilhar
                const shareButton = document.createElement('button'); // Cria um novo botão
                shareButton.textContent = 'Compartilhar'; // Define o texto do botão
                shareButton.addEventListener('click', () => { // Adiciona um ouvinte de evento de clique ao botão
                    shareImage(response.url); // Chama a função shareImage ao clicar no botão
                });

                actionsDiv.appendChild(downloadButton); // Adiciona o botão de download ao div de ações
                actionsDiv.appendChild(copyLinkButton); // Adiciona o botão de copiar link ao div de ações
                actionsDiv.appendChild(shareButton); // Adiciona o botão de compartilhar ao div de ações

                imageCard.appendChild(img); // Adiciona a imagem ao cartão de imagem
                imageCard.appendChild(actionsDiv); // Adiciona o div de ações ao cartão de imagem

                imagesSection.appendChild(imageCard); // Adiciona o cartão de imagem à seção de imagens
            });
        })
        .catch((error) => { // Se ocorrer um erro ao carregar as imagens
            console.error('Erro ao carregar as imagens:', error); // Loga o erro no console
            imagesSection.innerHTML = '<p>Ocorreu um erro ao carregar as imagens.</p>'; // Exibe uma mensagem de erro na seção de imagens
        });
}

/**
 * Downloads an image from a given URL in Full HD resolution.
 *
 * @param {string} url - The URL of the image to download.
 */
function downloadImage(url) {
    const fullHdUrl = url.replace('fastly.', '').replace(/\/\d+\/\d+\./, '/1920/1080.'); // Substitui a URL da imagem para a resolução Full HD
    const link = document.createElement('a'); // Cria um novo elemento de link
    link.href = fullHdUrl; // Define a URL do link com a resolução ajustada
    link.download = 'imagem-fullhd.webp'; // Define o nome do arquivo para download
    document.body.appendChild(link); // Adiciona o link ao corpo do documento
    link.click(); // Simula um clique no link para iniciar o download
    document.body.removeChild(link); // Remove o link do corpo do documento
}

/**
 * Copies the provided URL to the clipboard and alerts the user upon success.
 *
 * @param {string} url - The URL to be copied to the clipboard.
 * @returns {void}
 */
function copyLink(url) {
    navigator.clipboard // Acessa a API de área de transferência
        .writeText(url) // Escreve o URL na área de transferência
        .then(() => { // Se a cópia for bem-sucedida
            alert('Link copiado para a área de transferência!'); // Exibe um alerta informando que o link foi copiado
        })
        .catch((err) => { // Se ocorrer um erro ao copiar o link
            console.error('Erro ao copiar o link:', err); // Loga o erro no console
        });
}

/**
 * Shares an image using the Web Share API if available, otherwise falls back to sharing via WhatsApp.
 *
 * @param {string} url - The URL of the image to be shared.
 */
function shareImage(url) {
    if (navigator.share) { // Verifica se a API de compartilhamento está disponível
        navigator // Acessa a API de compartilhamento
            .share({ // Chama o método de compartilhamento
                title: 'Imagem Aleatória', // Define o título do compartilhamento
                text: 'Confira esta imagem que encontrei!', // Define o texto do compartilhamento
                url: url, // Define a URL do compartilhamento
            })
            .then(() => console.log('Imagem compartilhada com sucesso')) // Loga uma mensagem de sucesso no console
            .catch((error) => console.error('Erro ao compartilhar:', error)); // Loga um erro no console se o compartilhamento falhar
    } else { // Se a API de compartilhamento não estiver disponível
        // Se a API não estiver disponível, use o WhatsApp como alternativa
        const whatsappUrl = `https://wa.me/?text=Confira esta imagem: ${encodeURIComponent(url)}`; // Gera uma URL para compartilhar via WhatsApp
        window.open(whatsappUrl, '_blank'); // Abre a URL do WhatsApp em uma nova aba
    }
}