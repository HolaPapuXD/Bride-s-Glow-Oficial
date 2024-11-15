function generateInvoice() {
    // Obtener valores del formulario
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const product = document.getElementById('product');
    const selectedProductText = product.options[product.selectedIndex].text;
    const selectedProductPrice = parseFloat(product.value);
    const quantity = parseInt(document.getElementById('quantity').value);
    
    // Calcular precio total
    let total = selectedProductPrice * quantity;
    
    // Mostrar los valores en la factura
    document.getElementById('invoiceName').innerText = name;
    document.getElementById('invoiceEmail').innerText = email;
    document.getElementById('invoicePhone').innerText = phone;
    document.getElementById('invoiceProduct').innerText = selectedProductText;
    document.getElementById('invoiceQuantity').innerText = quantity;
    document.getElementById('invoiceTotal').innerText = total.toLocaleString('es-CO');

    // Mostrar factura
    document.getElementById('invoice').style.display = 'block';
}
// Funciones de utilidad
function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

function generateInvoiceNumber() {
    const date = new Date();
    const random = Math.floor(Math.random() * 10000);
    return `FACT-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${random}`;
}

// Cargar resumen del carrito
function loadCartSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const summaryContainer = document.getElementById('cartSummary');
    
    if (cart.length === 0) {
        window.location.href = 'Catalogo.html';
        return;
    }

    let summaryHTML = '<div class="cart-items">';
    cart.forEach(item => {
        summaryHTML += `
            <div class="cart-item-summary">
                <img src="${item.image}" alt="${item.name}" class="item-thumbnail">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>Cantidad: ${item.quantity}</p>
                    <p>Precio: ${formatPrice(item.price)}</p>
                </div>
                <div class="item-total">
                    ${formatPrice(item.price * item.quantity)}
                </div>
            </div>
        `;
    });
    summaryHTML += '</div>';

    const totals = calculateTotals(cart);
    summaryHTML += `
        <div class="summary-totals">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>${formatPrice(totals.subtotal)}</span>
            </div>
            <div class="total-row">
                <span>IVA (19%):</span>
                <span>${formatPrice(totals.iva)}</span>
            </div>
            <div class="total-row final">
                <span>Total:</span>
                <span>${formatPrice(totals.total)}</span>
            </div>
        </div>
    `;

    summaryContainer.innerHTML = summaryHTML;
}

function calculateTotals(cart) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const iva = subtotal * 0.19;
    return {
        subtotal,
        iva,
        total: subtotal + iva
    };
}

async function generateInvoice(event) {
    event.preventDefault();
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    // Obtener datos del formulario
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        paymentMethod: document.getElementById('paymentMethod').value
    };

    // Generar número de factura y fecha
    document.getElementById('invoiceNumber').textContent = generateInvoiceNumber();
    document.getElementById('invoiceDate').textContent = new Date().toLocaleDateString('es-CO');

    // Llenar datos del cliente
    document.getElementById('invoiceName').textContent = formData.name;
    document.getElementById('invoiceEmail').textContent = formData.email;
    document.getElementById('invoicePhone').textContent = formData.phone;
    document.getElementById('invoiceAddress').textContent = formData.address;

    // Generar tabla de productos
    const invoiceItems = document.getElementById('invoiceItems');
    invoiceItems.innerHTML = '';
    
    cart.forEach(item => {
        const row = document.createElement('tr');
        const itemTotal = item.price * item.quantity;
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${formatPrice(item.price)}</td>
            <td>${formatPrice(itemTotal)}</td>
        `;
        invoiceItems.appendChild(row);
    });

    // Calcular y mostrar totales
    const totals = calculateTotals(cart);
    document.getElementById('invoiceSubtotal').textContent = formatPrice(totals.subtotal);
    document.getElementById('invoiceIVA').textContent = formatPrice(totals.iva);
    document.getElementById('invoiceTotal').textContent = formatPrice(totals.total);

    // Mostrar factura
    document.getElementById('invoice').style.display = 'block';
    
    // Hacer scroll a la factura
    document.getElementById('invoice').scrollIntoView({ behavior: 'smooth' });

    // Después de generar la factura y mostrarla
    try {
        const invoiceData = {
            customerName: document.getElementById('name').value,
            customerEmail: document.getElementById('email').value,
            customerPhone: document.getElementById('phone').value,
            customerAddress: document.getElementById('address').value,
            items: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            subtotal: totals.subtotal,
            iva: totals.iva,
            total: totals.total,
            invoiceNumber: document.getElementById('invoiceNumber').textContent,
            invoiceDate: document.getElementById('invoiceDate').textContent
        };

        const response = await fetch('/api/send-invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invoiceData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Factura enviada por correo exitosamente', 'success');
        } else {
            showNotification('Error al enviar la factura por correo', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al enviar la factura por correo', 'error');
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function finishPurchase() {
    // Limpiar carrito
    localStorage.removeItem('cart');
    
    // Mostrar mensaje de éxito
    alert('¡Gracias por tu compra! Te hemos enviado un correo con los detalles de tu pedido.');
    
    // Redireccionar al inicio
    window.location.href = 'Index.html';
}

// Inicializar página
document.addEventListener('DOMContentLoaded', loadCartSummary);

