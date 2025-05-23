const API_URL = 'http://127.0.0.1:8000/api'; // API nueva
let cart = JSON.parse(localStorage.getItem("cart")) || [];
const shippingCost = 5000;

function scrollToSection(id) {
    const section = document.getElementById(id);
    if (section) {
        section.scrollIntoView({ behavior: "smooth" });
    }
}

async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/dishes/`, {
            method: "GET",
            credentials: 'include', // Incluir cookies para CSRF
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Respuesta completa de la API:", JSON.stringify(data, null, 2)); // Depuración detallada

        // Manejar posibles estructuras de la respuesta
        let products = Array.isArray(data) ? data : data.data || [];
        if (!products.length) {
            console.warn("No se encontraron productos en la respuesta de la API");
            alert("No se encontraron productos para mostrar.");
            return;
        }

        // Imprimir todas las categorías únicas para depuración
        const categories = [...new Set(products.map(p => p.category || p.Categorias || p.categoria))];
        console.log("Categorías encontradas en la API:", categories);

        displayProducts(products);
    } catch (error) {
        console.error("Error al cargar los productos:", error);
        alert("No se pudieron cargar los productos. Verifica la consola para más detalles.");
    }
}

function displayProducts(products) {
    const sections = {
        Entradas: document.getElementById("entradas-container"),
        PlatoFuerte: document.getElementById("platos-container"),
        Bebidas: document.getElementById("bebidas-container"),
        Postre: document.getElementById("postres-container"),
    };

    // Depuración: Verificar si los contenedores existen
    console.log("Contenedores de categorías:", sections);
    Object.keys(sections).forEach(key => {
        if (!sections[key]) {
            console.warn(`Contenedor para la categoría ${key} no encontrado. Verifica el ID en el HTML.`);
        }
    });

    products.forEach(product => {
        console.log("Producto:", product);

        // Mapear los campos de la API nueva
        const productData = {
            id: product.id,
            producto: product.name || product.producto,
            precio: parseFloat(product.price || product.precio),
            imagen: product.image || product.imagen || "https://via.placeholder.com/150",
            descripcion: product.description || product.descripcion || "",
            Categorias: product.category || product.Categorias || product.categoria,
        };

        // Normalizar la categoría
        let categoryKey = productData.Categorias;
        if (categoryKey) {
            // Convertir a formato esperado (por ejemplo, "ENTRADA" -> "Entradas")
            categoryKey = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1).toLowerCase();
            // Mapeo de categorías
            if (categoryKey === "Entrada") categoryKey = "Entradas";
            if (categoryKey === "Bebida") categoryKey = "Bebidas";
            if (categoryKey === "Plato" || categoryKey === "Hamburguesa") categoryKey = "PlatoFuerte";
            if (categoryKey === "Postre") categoryKey = "Postre"; // Redundante, pero para claridad
        }

        console.log(`Producto: ${productData.producto}, Categoría original: ${productData.Categorias}, Categoría mapeada: ${categoryKey}`);

        const item = document.createElement("div");
        item.classList.add("menu-item");
        item.innerHTML = `
            <img src="${productData.imagen}" alt="${productData.producto}">
            <h3>${productData.producto}</h3>
            <h5>${productData.descripcion}</h5>
            <p class="price">$${productData.precio.toLocaleString('es-CO')}</p>
            <div class="controls">
                <button class="decrease">-</button>
                <input type="text" value="1" readonly>
                <button class="increase">+</button>
            </div>
            <button class="add-to-cart">Agregar</button>
        `;

        if (sections[categoryKey]) {
            console.log(`Añadiendo ${productData.producto} a ${categoryKey}`);
            sections[categoryKey].appendChild(item);
        } else {
            console.warn(`Categoría no encontrada para ${productData.producto}: ${categoryKey}`);
        }

        const quantityInput = item.querySelector("input");
        item.querySelector(".increase").addEventListener("click", () => {
            quantityInput.value = parseInt(quantityInput.value) + 1;
        });
        item.querySelector(".decrease").addEventListener("click", () => {
            if (parseInt(quantityInput.value) > 1) {
                quantityInput.value = parseInt(quantityInput.value) - 1;
            }
        });

        item.querySelector(".add-to-cart").addEventListener("click", () => {
            console.log("Botón Agregar clickeado, producto:", productData, "cantidad:", quantityInput.value);
            addToCart({
                id: productData.id,
                producto: productData.producto,
                precio: productData.precio,
                quantity: parseInt(quantityInput.value),
                imagen: productData.imagen,
                Categorias: productData.Categorias,
            });
        });
    });
}

function addToCart(product) {
    console.log("Añadiendo al carrito:", product);
    const identifier = product.id || product.producto;
    const existingProduct = cart.find(item => (item.id || item.producto) === identifier);
    if (existingProduct) {
        existingProduct.quantity += product.quantity;
    } else {
        cart.push(product);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartDisplay();
}

function updateCartDisplay() {
    const productList = document.getElementById("product-list");
    const cartItems = document.getElementById("cart-items");
    const totalProducts = document.getElementById("total-products");
    const val_t_prodcut = document.getElementById("val_t_prodcut");
    const envioEl = document.getElementById("Envio");
    const totalPrice = document.getElementById("total-price");

    // Actualizar cart-items
    if (cartItems) {
        cartItems.innerHTML = "";
        let total = 0;
        let quantity = 0;

        if (cart.length === 0) {
            if (totalProducts) totalProducts.textContent = "0";
            if (val_t_prodcut) val_t_prodcut.textContent = "$0";
            if (envioEl) envioEl.textContent = `$${shippingCost.toLocaleString('es-CO')}`;
            if (totalPrice) totalPrice.textContent = `$${shippingCost.toLocaleString('es-CO')}`;
        } else {
            cart.forEach((item, index) => {
                const itemTotal = item.precio * item.quantity;
                total += itemTotal;
                quantity += item.quantity;

                const itemElement = document.createElement("div");
                itemElement.classList.add("cart-item");
                itemElement.innerHTML = `
                    <p>${item.producto} x${item.quantity} - $${itemTotal.toLocaleString('es-CO')}</p>
                    <button class="remove" data-index="${index}">Eliminar</button>
                `;
                cartItems.appendChild(itemElement);
            });

            if (totalProducts) totalProducts.textContent = quantity;
            if (val_t_prodcut) val_t_prodcut.textContent = `$${total.toLocaleString('es-CO')}`;
            if (envioEl) envioEl.textContent = `$${shippingCost.toLocaleString('es-CO')}`;
            if (totalPrice) totalPrice.textContent = `$${(total + shippingCost).toLocaleString('es-CO')}`;
        }
    }

    // Actualizar product-list para mostrar los productos en el carrito
    if (productList) {
        productList.innerHTML = ""; // Limpiar el contenido previo

        cart.forEach((item, index) => {
            const itemElement = document.createElement("div");
            itemElement.classList.add("product");
            const imageUrl = item.imagen || "https://via.placeholder.com/150";
            itemElement.innerHTML = `
                <img src="${imageUrl}" alt="${item.producto}">
                <p>${item.producto}</p>
                <p>Precio Unitario: $${parseFloat(item.precio).toLocaleString('es-CO')}</p>
                <div class="controls">
                    <button class="decrease" data-index="${index}">-</button>
                    <input type="text" value="${item.quantity}" readonly>
                    <button class="increase" data-index="${index}">+</button>
                </div>
                <button class="remove" data-index="${index}">Eliminar</button>
            `;
            productList.appendChild(itemElement);
        });

        // Remover manejadores de eventos previos para evitar duplicación
        productList.replaceWith(productList.cloneNode(true)); // Clonar para limpiar eventos
        const newProductList = document.getElementById("product-list");
        newProductList.addEventListener("click", (e) => {
            const index = e.target.dataset.index;
            if (e.target.classList.contains("increase")) {
                console.log(`Incrementando cantidad para índice ${index}`);
                cart[index].quantity += 1;
            } else if (e.target.classList.contains("decrease")) {
                console.log(`Decrementando cantidad para índice ${index}`);
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                } else {
                    cart.splice(index, 1);
                }
            } else if (e.target.classList.contains("remove")) {
                console.log(`Eliminando producto en índice ${index}`);
                cart.splice(index, 1);
            }
            localStorage.setItem("cart", JSON.stringify(cart));
            updateCartDisplay();
        });
    }
}

// Función para obtener el token CSRF de la cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function checkout() {
    const customerName = document.getElementById("address")?.value.trim();
    const customerAddress = document.getElementById("apartment")?.value.trim();
    const customerPhone = document.getElementById("phone")?.value.trim();

    if (!customerName || !customerAddress || !customerPhone || cart.length === 0) {
        alert("Por favor, completa todos los campos y agrega productos al carrito.");
        return;
    }

    const orderData = {
        customer: {
            name: customerName,
            address: customerAddress,
            phone: customerPhone,
        },
        total: cart.reduce((sum, item) => sum + item.precio * item.quantity, 0) + shippingCost,
        items: cart.map(item => ({
            dish_id: item.id || item.producto,
            quantity: item.quantity,
            price: item.precio * item.quantity,
        })),
    };

    console.log("Enviando pedido:", orderData);

    try {
        // Obtener el token CSRF de la cookie
        const csrftoken = getCookie('csrftoken');

        const response = await fetch(`${API_URL}/orders/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken, // Incluir el token CSRF en la cabecera
            },
            body: JSON.stringify(orderData),
            credentials: 'include', // Incluir cookies en la solicitud
        });

        if (response.ok) {
            alert("Su compra ha sido finalizada. En un momento nuestro repartidor llevará su pedido.");
            localStorage.removeItem("cart");
            cart = [];
            updateCartDisplay();

            document.getElementById("address").value = "";
            document.getElementById("apartment").value = "";
            document.getElementById("phone").value = "";
        } else {
            const errorData = await response.json();
            console.error("Error al procesar el pedido:", errorData);
            alert("Hubo un error al procesar el pedido. Verifica la consola para más detalles.");
        }
    } catch (error) {
        console.error("Error al enviar el pedido:", error);
        alert("Hubo un error al conectar con el servidor.");
    }
}

if (document.getElementById("cart-items")) {
    document.getElementById("cart-items").addEventListener("click", (e) => {
        if (e.target.classList.contains("remove")) {
            const index = e.target.dataset.index;
            cart.splice(index, 1);
            localStorage.setItem("cart", JSON.stringify(cart));
            updateCartDisplay();
        }
    });
}

document.querySelector(".limpiar_ca")?.addEventListener("click", () => {
    localStorage.removeItem("cart");
    cart = [];
    updateCartDisplay();

    document.getElementById("address").value = "";
    document.getElementById("apartment").value = "";
    document.getElementById("phone").value = "";
});

document.querySelector(".checkout")?.addEventListener("click", checkout);

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("menus.html")) {
        fetchProducts();
    } else if (window.location.pathname.includes("carrito.html")) {
        updateCartDisplay();
    }
});