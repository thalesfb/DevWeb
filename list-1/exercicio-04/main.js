// Seleção de elementos
const captureButton = document.getElementById('capture-photo');
const uploadInput = document.getElementById('upload-photo');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const getLocationButton = document.getElementById('get-location');
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');
const photoForm = document.getElementById('photo-form');
const photosList = document.getElementById('photos-list');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalImage = document.getElementById('modal-image');
const modalMap = document.getElementById('modal-map');
let currentMap; // Variável para armazenar o mapa Leaflet

let photos = JSON.parse(localStorage.getItem('photos')) || [];
let photoData = '';

// Função para iniciar a câmera
function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.play();
            video.hidden = false;
            captureButton.textContent = 'Capturar Foto';
        })
        .catch((error) => {
            console.error('Erro ao acessar a câmera:', error);
            alert('Câmera não disponível ou permissão negada.');
        });
}

// Evento para abrir a câmera ou capturar a foto
captureButton.addEventListener('click', () => {
    if (captureButton.textContent === 'Abrir Câmera') {
        startCamera();
    } else {
        capturePhoto();
    }
});

// Função para capturar a foto
function capturePhoto() {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    photoData = canvas.toDataURL('image/png'); // Armazena a imagem capturada como uma URL de dados

    stopCamera();
    video.hidden = true;
    canvas.hidden = true;
    captureButton.textContent = 'Abrir Câmera';

    // Remove a prévia da foto anterior (se houver)
    const preview = document.querySelector('#photo-preview');
    if (preview) {
        preview.remove();
    }

    // Exibir uma prévia da nova foto capturada
    const imgPreview = document.createElement('img');
    imgPreview.id = 'photo-preview';
    imgPreview.src = photoData;
    document.querySelector('#form-section').appendChild(imgPreview);
}

// Função para parar a câmera
function stopCamera() {
    const stream = video.srcObject;
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }
}

// Evento para upload de foto
uploadInput.addEventListener('change', function () {
    const file = this.files[0];
    const reader = new FileReader();
    reader.onloadend = function () {
        photoData = reader.result;

        // Remove a prévia anterior, se existir
        const preview = document.querySelector('#photo-preview');
        if (preview) {
            preview.remove();
        }

        // Exibir prévia da imagem carregada via upload
        const imgPreview = document.createElement('img');
        imgPreview.id = 'photo-preview';
        imgPreview.src = photoData;
        document.querySelector('#form-section').appendChild(imgPreview);
    };
    if (file) {
        reader.readAsDataURL(file);
    }
});

// Evento para obter localização
getLocationButton.addEventListener('click', () => {
    if (navigator.geolocation) {
        getLocationButton.disabled = true;
        getLocationButton.textContent = 'Obtendo localização...';
        navigator.geolocation.getCurrentPosition(
            (position) => {
                latitudeInput.value = position.coords.latitude.toFixed(6);
                longitudeInput.value = position.coords.longitude.toFixed(6);
                getLocationButton.disabled = false;
                getLocationButton.textContent = 'Marcar Localização Atual';
            },
            (error) => {
                console.error('Erro ao obter localização:', error);
                alert('Não foi possível obter a localização.');
                getLocationButton.disabled = false;
                getLocationButton.textContent = 'Marcar Localização Atual';
            }
        );
    } else {
        alert('Geolocalização não suportada neste dispositivo.');
    }
});

// Evento de submissão do formulário
photoForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const latitude = parseFloat(latitudeInput.value);
    const longitude = parseFloat(longitudeInput.value);

    // Validação dos campos
    if (!title) {
        alert('O título é obrigatório.');
        return;
    }

    if (!photoData) {
        alert('Por favor, capture ou faça upload de uma foto.');
        return;
    }

    if (isNaN(latitude) || isNaN(longitude)) {
        alert('Por favor, forneça coordenadas de localização válidas.');
        return;
    }

    const newPhoto = {
        id: Date.now(),
        title,
        description,
        photoData,
        latitude,
        longitude,
        date: new Date().toLocaleString(),
    };

    photos.push(newPhoto);
    localStorage.setItem('photos', JSON.stringify(photos));
    renderPhotos();
    photoForm.reset();
    photoData = '';
    canvas.hidden = true;

    // Remove a prévia da foto após salvar
    const preview = document.querySelector('#photo-preview');
    if (preview) {
        preview.remove();
    }

    alert('Foto salva com sucesso!');
});

// Função para exibir as fotos na lista
function renderPhotos() {
    photosList.innerHTML = '';

    if (photos.length === 0) {
        photosList.innerHTML = '<p>Não há fotos cadastradas.</p>';
        return;
    }

    photos.forEach((photo) => {
        const photoCard = document.createElement('div');
        photoCard.classList.add('photo-card');

        photoCard.innerHTML = `
      <img src="${photo.photoData}" alt="${photo.title}" />
      <div class="photo-details">
        <h3>${photo.title}</h3>
        <p>${photo.description || 'Sem descrição'}</p>
        <p><strong>Data:</strong> ${photo.date}</p>
        <div class="photo-actions">
          <button data-id="${photo.id}" class="view-button">Visualizar</button>
          <button data-id="${photo.id}" class="edit-button">Editar</button>
          <button data-id="${photo.id}" class="delete-button">Excluir</button>
        </div>
      </div>
    `;

        photosList.appendChild(photoCard);
    });
}

// Carregar as fotos ao iniciar
renderPhotos();

// Função para visualizar e editar fotos
document.addEventListener('click', (event) => {
    const id = event.target.dataset.id; // Obtém o ID da foto a partir do atributo data-id

    // Visualizar Foto
    if (event.target.classList.contains('view-button')) {
        const photo = photos.find((p) => p.id == id); // Busca a foto pelo ID no array

        // Preenche os elementos da modal com os dados da foto
        modalTitle.textContent = photo.title;
        modalDescription.textContent = photo.description;
        modalImage.src = photo.photoData;
        modalImage.alt = photo.title;

        // Exibir mapa usando Leaflet.js
        if (currentMap) {
            currentMap.remove(); // Remove o mapa anterior, se houver
        }

        modalMap.innerHTML = ''; // Limpa o conteúdo anterior do mapa
        currentMap = L.map(modalMap).setView([photo.latitude, photo.longitude], 13); // Centraliza o mapa na localização da foto
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(currentMap); // Adiciona as camadas de mapa do OpenStreetMap
        L.marker([photo.latitude, photo.longitude]).addTo(currentMap); // Adiciona um marcador no local da foto

        modal.style.display = 'block'; // Exibe a modal
        modal.setAttribute('aria-hidden', 'false'); // Acessibilidade: remove o atributo que oculta a modal
    }

    // Editar Foto
    else if (event.target.classList.contains('edit-button')) {
        const photo = photos.find((p) => p.id == id); // Busca a foto pelo ID no array

        // Preenche o formulário com os dados existentes da foto
        document.getElementById('title').value = photo.title;
        document.getElementById('description').value = photo.description;
        latitudeInput.value = photo.latitude;
        longitudeInput.value = photo.longitude;
        photoData = photo.photoData;

        // Exibir a foto original na prévia ao editar
        const preview = document.querySelector('#photo-preview');
        if (preview) {
            preview.remove(); // Remove a prévia anterior, se existir
        }
        const imgPreview = document.createElement('img');
        imgPreview.id = 'photo-preview';
        imgPreview.src = photo.photoData; // Exibe a mesma foto no formulário para edição
        document.querySelector('#form-section').appendChild(imgPreview);

        // Remover a foto original da lista para que a edição seja salva como um novo registro
        photos = photos.filter((p) => p.id != id); // Remove o registro da foto a ser editada
        localStorage.setItem('photos', JSON.stringify(photos)); // Atualiza o localStorage com a nova lista sem a foto antiga
        renderPhotos(); // Atualiza a lista de fotos renderizada
    }
});

// Fechar a modal ao clicar no botão de fechar
closeModal.addEventListener('click', () => {
    modal.style.display = 'none'; // Oculta a modal
    modal.setAttribute('aria-hidden', 'true'); // Acessibilidade: adiciona o atributo que oculta a modal
});

// Fechar a modal ao clicar fora do conteúdo da modal
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }
});
