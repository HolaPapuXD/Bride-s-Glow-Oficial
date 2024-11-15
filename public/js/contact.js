document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        message: document.getElementById('message').value
    };

    try {
        showNotification('Enviando mensaje...', 'info');

        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Respuesta del servidor:', data);

        if (data.success) {
            showNotification('¡Mensaje enviado con éxito!', 'success');
            document.getElementById('contactForm').reset();
        } else {
            showNotification(`Error: ${data.message || 'Error desconocido'}`, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión. Por favor, intenta de nuevo.', 'error');
    }
});

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
} 