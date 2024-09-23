// Select elements from the DOM
const captureButton = document.getElementById('capture-photo'); // Capture button
const uploadInput = document.getElementById('upload-photo'); // Upload input
const video = document.getElementById('video'); // Video element
const canvas = document.getElementById('canvas'); // Canvas element
const getLocationButton = document.getElementById('get-location'); // Get location button
const latitudeInput = document.getElementById('latitude'); // Latitude input
const longitudeInput = document.getElementById('longitude'); // Longitude input
const photoForm = document.getElementById('photo-form'); // Photo form
const photosList = document.getElementById('photos-list'); // Photo list
const modal = document.getElementById('modal'); // Modal element
const closeModal = document.getElementById('close-modal'); // Close modal button
const modalTitle = document.getElementById('modal-title'); // Modal title
const modalDescription = document.getElementById('modal-description'); // Modal description
const modalImage = document.getElementById('modal-image'); // Modal image
const modalMap = document.getElementById('modal-map'); // Modal map
let currentMap; // Variable to store the Leaflet map instance
let editingPhotoId = null; // ID of the photo currently being edited
let photos = JSON.parse(localStorage.getItem('photos')) || []; // Load photos from localStorage or initialize an empty array
let photoData = ''; // Stores the captured or uploaded photo data

/**
 * Starts the camera and streams the video to a video element.
 * 
 * This function requests access to the user's camera and, if granted,
 * streams the video to a video element on the page. If the camera is 
 * not available or permission is denied, an error message is logged 
 * and an alert is shown to the user.
 * 
 * @function
 * @returns {void}
 */
function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.play();
            video.hidden = false;
            captureButton.textContent = 'Capturar Foto';
        })
        .catch((error) => {
            console.error('Error accessing the camera:', error);
            alert('Camera not available or permission denied.');
        });
}

// Event to toggle between opening the camera or capturing the photo
captureButton.addEventListener('click', () => {
    if (captureButton.textContent === 'Abrir Câmera') {
        startCamera(); // Open the camera
    } else {
        capturePhoto(); // Capture the photo
    }
});

/**
 * Captures a photo from the video stream, draws it on a canvas, and displays the captured image.
 * 
 * This function performs the following steps:
 * 1. Gets the 2D rendering context of the canvas.
 * 2. Sets the canvas dimensions to match the video dimensions.
 * 3. Draws the current frame from the video onto the canvas.
 * 4. Converts the canvas content to a data URL representing the image in PNG format.
 * 5. Stops the camera and hides the video and canvas elements.
 * 6. Changes the capture button text to 'Abrir Câmera'.
 * 7. Removes any previous photo preview if it exists.
 * 8. Creates a new image element to display the captured photo.
 * 9. Appends the new image element to the photo fieldset.
 * 
 * @function capturePhoto
 */
function capturePhoto() {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame on the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Convert the canvas content to a PNG image URL
    photoData = canvas.toDataURL('image/png');

    stopCamera(); // Stop the camera
    video.hidden = true;
    canvas.hidden = true;
    captureButton.textContent = 'Abrir Câmera'; // Change button text

    // Update photo preview
    const preview = document.querySelector('#photo-preview');
    if (preview) {
        preview.remove(); // Remove existing preview
    }
    const imgPreview = document.createElement('img');
    imgPreview.id = 'photo-preview';
    imgPreview.src = photoData; // Set the new photo data
    imgPreview.style.display = 'block';
    document.querySelector('#photo-fieldset').appendChild(imgPreview); // Display the new preview
}

/**
 * Stops the camera by stopping all tracks of the media stream
 * associated with the video element and setting the video source
 * object to null.
 */
function stopCamera() {
    const stream = video.srcObject;
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop()); // Stop each track
        video.srcObject = null;
    }
}

// Event to handle photo upload from the file input
uploadInput.addEventListener('change', function () {
    const file = this.files[0];
    const reader = new FileReader();
    reader.onloadend = function () {
        photoData = reader.result; // Store the uploaded image as data URL

        // Remove previous preview if it exists
        const preview = document.querySelector('#photo-preview');
        if (preview) {
            preview.remove();
        }

        // Display the uploaded image as preview
        const imgPreview = document.createElement('img');
        imgPreview.id = 'photo-preview';
        imgPreview.src = photoData;
        document.querySelector('#form-section').appendChild(imgPreview);
    };
    if (file) {
        reader.readAsDataURL(file); // Convert the file to a data URL
    }
});

// Event to get the user's current location
getLocationButton.addEventListener('click', () => {
    if (navigator.geolocation) {
        getLocationButton.disabled = true;
        getLocationButton.textContent = 'Obtendo localização...'; // Updating button text
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Set latitude and longitude in the form
                latitudeInput.value = position.coords.latitude.toFixed(6);
                longitudeInput.value = position.coords.longitude.toFixed(6);
                getLocationButton.disabled = false;
                getLocationButton.textContent = 'Marcar Localização Atual';
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Could not get location.');
                getLocationButton.disabled = false;
                getLocationButton.textContent = 'Marcar Localização Atual';
            }
        );
    } else {
        alert('Geolocation is not supported on this device.');
    }
});

// Event handler for form submission to save the photo
photoForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const latitude = parseFloat(latitudeInput.value);
    const longitude = parseFloat(longitudeInput.value);

    // Validate form fields
    if (!title) {
        alert('Title is required.');
        return;
    }

    if (!photoData) {
        alert('Please capture or upload a photo.');
        return;
    }

    if (isNaN(latitude) || isNaN(longitude)) {
        alert('Please provide valid location coordinates.');
        return;
    }

    // Update existing photo if editing, otherwise create a new one
    if (editingPhotoId !== null) {
        const photoIndex = photos.findIndex(photo => photo.id === editingPhotoId);
        if (photoIndex !== -1) {
            photos[photoIndex] = {
                id: editingPhotoId,
                title,
                description,
                photoData,
                latitude,
                longitude,
                date: new Date().toLocaleString(),
            };
        }
        editingPhotoId = null; // Reset editing ID

        alert('Foto atualizada com sucesso!');
    } else {
        const newPhoto = {
            id: Date.now(),
            title,
            description,
            photoData,
            latitude,
            longitude,
            date: new Date().toLocaleString(),
        };

        photos.push(newPhoto); // Add new photo

        alert('Foto salva com sucesso!');
    }

    localStorage.setItem('photos', JSON.stringify(photos)); // Save to localStorage
    renderPhotos(); // Update the photo list
    photoForm.reset(); // Reset the form
    photoData = ''; // Reset photo data
    canvas.hidden = true;

    // Hide the photo preview
    const imgPreview = document.getElementById('photo-preview');
    imgPreview.style.display = 'none';
});

/**
 * Renders a list of photos to the DOM.
 * 
 * This function clears the current content of the `photosList` element and 
 * populates it with photo cards based on the `photos` array. Each photo card 
 * includes the photo, title, description, date, and action buttons for viewing, 
 * editing, and deleting the photo.
 * 
 * If there are no photos in the `photos` array, a message indicating that no 
 * photos are registered is displayed.
 * 
 * @function
 */
function renderPhotos() {
    photosList.innerHTML = '';

    if (photos.length === 0) {
        photosList.innerHTML = '<p>No photos registered.</p>';
        return;
    }

    photos.forEach((photo) => {
        const photoCard = document.createElement('div');
        photoCard.classList.add('photo-card');

        // Build the photo card
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
        photosList.appendChild(photoCard); // Append each photo card
    });
}

// Load and display photos on page load
renderPhotos();

/**
 * Handles events for viewing, editing, and deleting photos.
 * 
 * Depending on the button clicked, this function either:
 * - Displays the modal to view photo details.
 * - Fills the form with photo details for editing.
 * - Deletes the photo and updates the list.
 */
document.addEventListener('click', (event) => {
    const id = event.target.dataset.id; // Get the photo ID from the clicked button

    // View Photo
    if (event.target.classList.contains('view-button')) {
        const photo = photos.find((p) => p.id == id); // Find the photo by ID

        // Populate the modal with the photo details
        modalTitle.textContent = photo.title;
        modalDescription.textContent = photo.description;
        modalImage.src = photo.photoData;
        modalImage.alt = photo.title;

        // Initialize the map with the photo's location
        if (currentMap) {
            currentMap.remove(); // Remove existing map if present
        }

        modalMap.innerHTML = ''; // Clear previous map content
        currentMap = L.map(modalMap).setView([photo.latitude, photo.longitude], 13); // Set view to photo location
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(currentMap); // Add map tiles
        L.marker([photo.latitude, photo.longitude]).addTo(currentMap); // Add a marker at the photo's location

        setTimeout(() => {
            currentMap.invalidateSize(); // Ensure the map renders correctly
        }, 300);

        modal.style.display = 'block'; // Show the modal
        modal.setAttribute('aria-hidden', 'false');
    }

    // Edit Photo
    else if (event.target.classList.contains('edit-button')) {
        const photo = photos.find((p) => p.id == id); // Find the photo by ID

        // Populate the form with the existing photo details
        document.getElementById('title').value = photo.title;
        document.getElementById('description').value = photo.description;
        latitudeInput.value = photo.latitude;
        longitudeInput.value = photo.longitude;
        photoData = photo.photoData; // Keep the existing photo data
        editingPhotoId = photo.id; // Store the ID of the photo being edited

        // Show the existing photo in the preview
        const preview = document.querySelector('#photo-preview');
        if (preview) {
            preview.remove(); // Remove previous preview
        }
        const imgPreview = document.createElement('img');
        imgPreview.id = 'photo-preview';
        imgPreview.src = photo.photoData; // Show the existing photo
        imgPreview.style.display = 'block';
        document.querySelector('#photo-fieldset').appendChild(imgPreview);
    }

    // Delete Photo
    else if (event.target.classList.contains('delete-button')) {
        const confirmDelete = confirm('Você tem certeza que deseja excluir esta foto?');
        if (confirmDelete) {
            // Remove the photo from the array
            photos = photos.filter((p) => p.id != id);

            // Update localStorage and refresh the photo list
            localStorage.setItem('photos', JSON.stringify(photos));
            renderPhotos(); // Re-render the photo list
            alert('Foto deletada com sucesso!');
        }
    }
});

// Close the modal when the close button is clicked
closeModal.addEventListener('click', () => {
    modal.style.display = 'none'; // Hide the modal
    modal.setAttribute('aria-hidden', 'true');
});

// Close the modal when clicking outside of the modal content
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }
});