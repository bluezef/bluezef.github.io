
// Clase Producto para representar cada artículo
class Product {
    constructor(id, name, price, stock, image = null) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.stock = stock;
        this.image = image;
    }
}

// Clase ItemCarrito para los productos añadidos al carrito
class CartItem {
    constructor(product, quantity) {
        this.product = product;
        this.quantity = quantity;
    }
    
    getTotal() {
        return this.product.price * this.quantity;
    }
}

// Clase Carrito que gestiona todos los items
class Cart {
    constructor() {
        this.items = [];
        this.taxRate = 0.16; // 16% de impuestos
    }
    
    addItem(product, quantity) {
        // Verificar si el producto ya está en el carrito
        const existingItem = this.items.find(item => item.product.id === product.id);
        
        if (existingItem) {
            // Si ya existe, actualizar la cantidad
            existingItem.quantity += quantity;
        } else {
            // Si no existe, agregar nuevo item
            this.items.push(new CartItem(product, quantity));
        }
        
        // Actualizar el stock del producto
        product.stock -= quantity;
    }
    
    removeItem(productId) {
        // Encontrar el índice del item
        const index = this.items.findIndex(item => item.product.id === productId);
        
        if (index !== -1) {
            // Restaurar el stock del producto
            const item = this.items[index];
            item.product.stock += item.quantity;
            
            // Eliminar el item del carrito
            this.items.splice(index, 1);
        }
    }
    
    updateQuantity(productId, newQuantity) {
        const item = this.items.find(item => item.product.id === productId);
        
        if (item) {
            // Calcular la diferencia de cantidad
            const quantityDifference = newQuantity - item.quantity;
            
            // Actualizar el stock del producto
            item.product.stock -= quantityDifference;
            
            // Actualizar la cantidad en el carrito
            item.quantity = newQuantity;
            
            // Si la cantidad es 0, eliminar el item
            if (newQuantity <= 0) {
                this.removeItem(productId);
            }
        }
    }
    
    getSubtotal() {
        return this.items.reduce((total, item) => total + item.getTotal(), 0);
    }
    
    getTaxes() {
        return this.getSubtotal() * this.taxRate;
    }
    
    getTotal() {
        return this.getSubtotal() + this.getTaxes();
    }
    
    clear() {
        // Restaurar el stock de todos los productos
        this.items.forEach(item => {
            item.product.stock += item.quantity;
        });
        
        // Vaciar el carrito
        this.items = [];
    }
}

// Clase Tienda que gestiona la aplicación completa
class Store {
    constructor() {
        this.products = [
            new Product(1, "Laptop Gaming", 1200, 10),
            new Product(2, "Smartphone Android", 500, 15),
            new Product(3, "Tablet 10 pulgadas", 300, 8),
            new Product(4, "Auriculares Bluetooth", 80, 20),
            new Product(5, "Teclado Mecánico", 120, 12),
            new Product(6, "Monitor 24\"", 250, 7),
            new Product(7, "Mouse Inalámbrico", 40, 18),
            new Product(8, "Impresora Multifuncional", 200, 5)
        ];
        
        this.cart = new Cart();
        this.currentInvoiceNumber = 1000;
        
        // Inicializar la aplicación
        this.init();
    }
    
    init() {
        // Cargar productos en la interfaz
        this.renderProducts();
        
        // Configurar event listeners
        document.getElementById('checkout-btn').addEventListener('click', () => this.checkout());
        document.getElementById('continue-shopping').addEventListener('click', () => this.hideInvoice());
        
        // Actualizar el carrito inicial
        this.updateCart();
    }
    
    renderProducts() {
        const productsContainer = document.getElementById('products-container');
        productsContainer.innerHTML = '';
        
        this.products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <h3>${product.name}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-stock">Disponible: ${product.stock}</div>
                <div class="product-form">
                    <input type="number" min="1" max="${product.stock}" value="1" 
                        id="quantity-${product.id}" class="quantity-input">
                    <button class="add-to-cart" data-id="${product.id}">Agregar al Carrito</button>
                    <div class="error-message" id="error-${product.id}"></div>
                </div>
            `;
            productsContainer.appendChild(productCard);
            
            // Agregar event listener al botón
            const addButton = productCard.querySelector('.add-to-cart');
            addButton.addEventListener('click', () => {
                const quantityInput = document.getElementById(`quantity-${product.id}`);
                const quantity = parseInt(quantityInput.value);
                const errorElement = document.getElementById(`error-${product.id}`);
                
                // Validar la cantidad
                if (isNaN(quantity) || quantity <= 0) {
                    errorElement.textContent = 'Por favor ingrese una cantidad válida';
                    return;
                }
                
                if (quantity > product.stock) {
                    errorElement.textContent = 'No hay suficiente stock disponible';
                    return;
                }
                
                // Si pasa las validaciones, agregar al carrito
                errorElement.textContent = '';
                this.addToCart(product.id, quantity);
                quantityInput.value = '1'; // Resetear el input
            });
        });
    }
    
    addToCart(productId, quantity) {
        const product = this.products.find(p => p.id === productId);
        
        if (product) {
            this.cart.addItem(product, quantity);
            this.updateCart();
            
            // Mostrar mensaje de éxito (podría ser un toast en una implementación más avanzada)
            alert(`${quantity} ${product.name}(s) agregado(s) al carrito`);
        }
    }
    
    removeFromCart(productId) {
        this.cart.removeItem(productId);
        this.updateCart();
    }
    
    updateCart() {
        const cartItemsContainer = document.getElementById('cart-items');
        const subtotalElement = document.getElementById('subtotal');
        const taxesElement = document.getElementById('taxes');
        const totalElement = document.getElementById('total');
        
        // Limpiar el contenedor
        cartItemsContainer.innerHTML = '';
        
        if (this.cart.items.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart">Tu carrito está vacío</div>';
            subtotalElement.textContent = '$0.00';
            taxesElement.textContent = '$0.00';
            totalElement.textContent = '$0.00';
            return;
        }
        
        // Agregar cada item del carrito
        this.cart.items.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.product.name}</div>
                    <div class="cart-item-price">$${item.product.price.toFixed(2)} c/u</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease" data-id="${item.product.id}">-</button>
                    <input type="number" value="${item.quantity}" min="1" max="${item.product.stock + item.quantity}" 
                        class="quantity-input" data-id="${item.product.id}">
                    <button class="quantity-btn increase" data-id="${item.product.id}">+</button>
                    <button class="remove-item" data-id="${item.product.id}">×</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
            
            // Agregar event listeners a los botones
            const decreaseBtn = cartItemElement.querySelector('.decrease');
            const increaseBtn = cartItemElement.querySelector('.increase');
            const quantityInput = cartItemElement.querySelector('.quantity-input');
            const removeBtn = cartItemElement.querySelector('.remove-item');
            
            decreaseBtn.addEventListener('click', () => {
                const newQuantity = parseInt(quantityInput.value) - 1;
                if (newQuantity >= 1) {
                    quantityInput.value = newQuantity;
                    this.updateItemQuantity(item.product.id, newQuantity);
                }
            });
            
            increaseBtn.addEventListener('click', () => {
                const newQuantity = parseInt(quantityInput.value) + 1;
                if (newQuantity <= item.product.stock + item.quantity) {
                    quantityInput.value = newQuantity;
                    this.updateItemQuantity(item.product.id, newQuantity);
                }
            });
            
            quantityInput.addEventListener('change', () => {
                const newQuantity = parseInt(quantityInput.value);
                if (newQuantity >= 1 && newQuantity <= item.product.stock + item.quantity) {
                    this.updateItemQuantity(item.product.id, newQuantity);
                } else {
                    quantityInput.value = item.quantity; // Revertir al valor anterior
                }
            });
            
            removeBtn.addEventListener('click', () => {
                this.removeFromCart(item.product.id);
            });
        });
        
        // Actualizar totales
        subtotalElement.textContent = `$${this.cart.getSubtotal().toFixed(2)}`;
        taxesElement.textContent = `$${this.cart.getTaxes().toFixed(2)}`;
        totalElement.textContent = `$${this.cart.getTotal().toFixed(2)}`;
        
        // Actualizar la lista de productos (por si cambió el stock)
        this.renderProducts();
    }
    
    updateItemQuantity(productId, newQuantity) {
        this.cart.updateQuantity(productId, newQuantity);
        this.updateCart();
    }
    
    checkout() {
        if (this.cart.items.length === 0) {
            alert('Tu carrito está vacío. Agrega algunos productos antes de finalizar la compra.');
            return;
        }
        
        // Generar factura
        this.generateInvoice();
        
        // Limpiar el carrito
        this.cart.clear();
        this.updateCart();
    }
    
    generateInvoice() {
        // Mostrar la sección de factura
        const invoiceElement = document.getElementById('invoice');
        invoiceElement.classList.add('invoice-visible');
        
        // Generar número de factura y fecha
        this.currentInvoiceNumber++;
        const now = new Date();
        
        document.getElementById('invoice-date').textContent = now.toLocaleDateString();
        document.getElementById('invoice-number').textContent = this.currentInvoiceNumber;
        
        // Llenar la tabla de items
        const invoiceItemsBody = document.getElementById('invoice-items-body');
        invoiceItemsBody.innerHTML = '';
        
        this.cart.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.product.name}</td>
                <td>${item.quantity}</td>
                <td>$${item.product.price.toFixed(2)}</td>
                <td>$${item.getTotal().toFixed(2)}</td>
            `;
            invoiceItemsBody.appendChild(row);
        });
        
        // Actualizar totales
        document.getElementById('invoice-subtotal').textContent = `$${this.cart.getSubtotal().toFixed(2)}`;
        document.getElementById('invoice-taxes').textContent = `$${this.cart.getTaxes().toFixed(2)}`;
        document.getElementById('invoice-total').textContent = `$${this.cart.getTotal().toFixed(2)}`;
        
        // Desplazarse a la factura
        invoiceElement.scrollIntoView({ behavior: 'smooth' });
    }
    
    hideInvoice() {
        // Ocultar la factura
        const invoiceElement = document.getElementById('invoice');
        invoiceElement.classList.remove('invoice-visible');
        
        // Desplazarse al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Inicializar la tienda cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    const store = new Store();
});