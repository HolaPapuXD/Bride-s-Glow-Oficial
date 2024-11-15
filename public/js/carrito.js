// Funciones de utilidad
function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

// Gestión del carrito
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.updateCartDisplay();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => this.updateCartDisplay());
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        
        this.saveCart();
        this.updateCartDisplay();
    }

    updateQuantity(index, change) {
        const item = this.items[index];
        const newQuantity = item.quantity + change;
        
        if (newQuantity < 1) {
            this.removeItem(index);
        } else {
            item.quantity = newQuantity;
            this.saveCart();
            this.updateCartDisplay();
        }
    }

    removeItem(index) {
        this.items.splice(index, 1);
        this.saveCart();
        this.updateCartDisplay();
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    calculateTotals() {
        const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return {
            subtotal,
            shipping: 0, // Gratis por ahora, podría ser calculado según peso/distancia
            total: subtotal
        };
    }

    updateCartDisplay() {
        const cartContainer = document.getElementById('cartItems');
        const cartEmpty = document.getElementById('cartEmpty');
        const cartCount = document.getElementById('cartCount');
        
        if (!cartContainer) return;

        cartContainer.innerHTML = '';
        
        // Actualizar contador de items
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;

        // Mostrar mensaje de carrito vacío o items
        if (this.items.length === 0) {
            cartEmpty.style.display = 'block';
            cartContainer.style.display = 'none';
        } else {
            cartEmpty.style.display = 'none';
            cartContainer.style.display = 'block';
            
            this.items.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                const cartItem = this.createCartItemElement(item, index, itemTotal);
                cartContainer.appendChild(cartItem);
            });
        }

        // Actualizar totales
        const totals = this.calculateTotals();
        document.getElementById('subtotal').textContent = formatPrice(totals.subtotal);
        document.getElementById('total').textContent = formatPrice(totals.total);
    }

    createCartItemElement(item, index, itemTotal) {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        // Asegurarse de que la ruta de la imagen sea correcta
        const imagePath = item.image.startsWith('../') ? item.image : '../img/' + item.image;
        
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${imagePath}" alt="${item.name}" onerror="this.src='../img/default.jpg'">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-price">${formatPrice(item.price)}</p>
            </div>
            <div class="quantity-control">
                <button class="quantity-btn" onclick="cart.updateQuantity(${index}, -1)">-</button>
                <span class="quantity-number">${item.quantity}</span>
                <button class="quantity-btn" onclick="cart.updateQuantity(${index}, 1)">+</button>
            </div>
            <div class="cart-item-total">${formatPrice(itemTotal)}</div>
            <button class="remove-btn" onclick="cart.removeItem(${index})">
                <span class="remove-icon">×</span>
            </button>
        `;
        return cartItem;
    }
}

// Inicializar carrito
const cart = new ShoppingCart();

// Función para añadir productos desde el catálogo
function addToCart(product) {
    cart.addItem(product);
}

// Función para proceder al checkout
function proceedToCheckout() {
    if (cart.items.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    window.location.href = 'Compra.html';
}