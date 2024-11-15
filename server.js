require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));
app.use('/html', express.static(path.join(__dirname, 'public/html')));

// Middleware con log
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Configuración actualizada del transportador de correo
const transporter = nodemailer.createTransport({
    service: 'gmail',  // Usar 'service' en lugar de 'host'
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false  // Ignorar verificación de certificado
    }
});

// Verificar la conexión al iniciar con manejo de errores mejorado
transporter.verify((error, success) => {
    if (error) {
        console.error('Error al verificar el transportador:', error);
        console.error('Configuración actual:', {
            email: process.env.EMAIL_USER,
            passConfigured: !!process.env.EMAIL_PASS
        });
    } else {
        console.log('Servidor listo para enviar correos');
    }
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

// Rutas específicas para cada página
app.get('/catalogo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/Catalago.html'));
});

app.get('/carrito', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/Carrito.html'));
});

app.get('/compra', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/Compra.html'));
});

// Ruta para enviar correos con mejor manejo de errores
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        
        console.log('Intentando enviar correo a:', email);

        const info = await transporter.sendMail({
            from: `"Bride's Glow" <${process.env.EMAIL_USER}>`,
            to: [process.env.EMAIL_USER, email],
            subject: 'Nuevo mensaje de contacto - Bride\'s Glow',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Nuevo Mensaje de Contacto</h2>
                    <p><strong>Nombre:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Teléfono:</strong> ${phone}</p>
                    <p><strong>Mensaje:</strong> ${message}</p>
                </div>
            `
        });

        console.log('Mensaje enviado exitosamente:', info.messageId);
        res.json({ 
            success: true, 
            messageId: info.messageId,
            message: 'Correo enviado exitosamente'
        });

    } catch (error) {
        console.error('Error al enviar correo:', error);
        res.status(500).json({
            error: true,
            message: 'Error al enviar el correo: ' + error.message
        });
    }
});

// Nueva ruta para enviar factura
app.post('/api/send-invoice', async (req, res) => {
    try {
        const { 
            customerEmail, 
            customerName, 
            customerPhone, 
            customerAddress, 
            items, 
            subtotal, 
            iva, 
            total,
            invoiceNumber,
            invoiceDate
        } = req.body;

        // Crear el HTML de la factura
        const invoiceHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
                <h2>Factura de Compra - Bride's Glow</h2>
                <div style="margin-bottom: 20px;">
                    <p><strong>Factura No:</strong> ${invoiceNumber}</p>
                    <p><strong>Fecha:</strong> ${invoiceDate}</p>
                </div>

                <div style="margin-bottom: 20px;">
                    <h3>Datos del Cliente</h3>
                    <p><strong>Nombre:</strong> ${customerName}</p>
                    <p><strong>Email:</strong> ${customerEmail}</p>
                    <p><strong>Teléfono:</strong> ${customerPhone}</p>
                    <p><strong>Dirección:</strong> ${customerAddress}</p>
                </div>

                <div style="margin-bottom: 20px;">
                    <h3>Productos</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="padding: 10px; border: 1px solid #ddd;">Producto</th>
                                <th style="padding: 10px; border: 1px solid #ddd;">Cantidad</th>
                                <th style="padding: 10px; border: 1px solid #ddd;">Precio Unitario</th>
                                <th style="padding: 10px; border: 1px solid #ddd;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(item => `
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">${item.quantity}</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">$${item.price.toLocaleString()}</td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">$${(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div style="margin-top: 20px;">
                    <p><strong>Subtotal:</strong> $${subtotal.toLocaleString()}</p>
                    <p><strong>IVA (19%):</strong> $${iva.toLocaleString()}</p>
                    <p style="font-size: 1.2em;"><strong>Total:</strong> $${total.toLocaleString()}</p>
                </div>
            </div>
        `;

        // Enviar el correo
        await transporter.sendMail({
            from: `"Bride's Glow" <${process.env.EMAIL_USER}>`,
            to: [process.env.EMAIL_USER, customerEmail],
            subject: `Factura de Compra #${invoiceNumber} - Bride's Glow`,
            html: invoiceHTML
        });

        res.json({ 
            success: true, 
            message: 'Factura enviada exitosamente'
        });

    } catch (error) {
        console.error('Error al enviar la factura:', error);
        res.status(500).json({
            error: true,
            message: 'Error al enviar la factura: ' + error.message
        });
    }
});

// Agregar después de todas las rutas
app.use((req, res, next) => {
    console.log('404 - Recurso no encontrado:', req.url);
    res.status(404).send('Recurso no encontrado');
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Error interno del servidor');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log('Configuración de correo cargada:', {
        user: process.env.EMAIL_USER,
        passConfigured: !!process.env.EMAIL_PASS
    });
}); 