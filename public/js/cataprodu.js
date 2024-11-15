// Initialize cart in localStorage if it doesn't exist
if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', JSON.stringify([]));
}

// Function to update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelector('.cart-count').textContent = count;
}

// Function to show notification
function showNotification() {
    const notification = document.getElementById('cartNotification');
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
}


function addToCart(productName, price, imagePath) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Asegurarse de que la ruta de la imagen sea absoluta desde la raíz del proyecto
    const absoluteImagePath = imagePath.startsWith('../') ? imagePath : '../img/' + imagePath;
    
    const existingProduct = cart.find(item => item.name === productName);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1,
            image: absoluteImagePath
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification();
}

// Initialize cart count on page load
updateCartCount();
