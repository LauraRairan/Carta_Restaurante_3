// Función para obtener el token CSRF desde la cookie
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

document.addEventListener("DOMContentLoaded", async () => {
    // Hacer una solicitud GET inicial para obtener la cookie CSRF
    await fetch('http://127.0.0.1:8000/api/login/', {
        method: "GET",
        credentials: 'include' // Asegurar que las cookies se reciban
    });

    const loginForm = document.querySelector("#login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const csrfToken = getCookie('csrftoken'); // Obtener el token CSRF desde la cookie
            if (!csrfToken) {
                alert("No se pudo obtener el token CSRF. Recarga la página e inténtalo de nuevo.");
                return;
            }
            try {
                const response = await fetch('http://127.0.0.1:8000/api/login/', {
                    method: "POST",
                    body: formData,
                    headers: {
                        'X-CSRFToken': csrfToken // Incluir el token CSRF en el encabezado
                    },
                    credentials: 'include' // Asegurar que las cookies se envíen con la solicitud
                });

                // Verificar si la respuesta es JSON
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    const text = await response.text();
                    throw new Error(`Respuesta no es JSON: ${text}`);
                }

                const data = await response.json();
                console.log("Respuesta del servidor:", data);
                if (data.status === "success") {
                    window.location.href = "/pedidos.html";
                } else {
                    alert(data.message || "Error al iniciar sesión");
                }
            } catch (error) {
                console.error("Error al iniciar sesión:", error);
                alert("Error al conectar con el servidor.");
            }
        });
    }

    // Resto del código para pedidos
    if (window.location.pathname.includes("pedidos.html")) {
        fetchOrders();
    }
});

// Resto de las funciones (fetchOrders, displayOrders, etc.)
const API_URL = 'http://127.0.0.1:8000/api'; // Usamos la URL local

async function fetchOrders() {
    try {
        const statusFilter = document.getElementById('status-filter')?.value || '';
        const customerFilter = document.getElementById('customer-filter')?.value || '';
        let url = `${API_URL}/orders/`;
        
        // Agregar parámetros de filtro si existen
        const params = new URLSearchParams();
        if (statusFilter) params.append('status', statusFilter);
        if (customerFilter) params.append('customer__name__icontains', customerFilter);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url, {
            method: "GET",
            credentials: 'include'
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const pedidos = await response.json();
        console.log("Pedidos cargados:", pedidos);
        displayOrders(pedidos);
    } catch (error) {
        console.error("Error al cargar pedidos:", error);
    }
}

function displayOrders(pedidos) {
    const pedidosList = document.getElementById('orders-list');
    if (pedidosList) {
        pedidosList.innerHTML = '';
        pedidos.forEach(pedido => {
            const div = document.createElement('div');
            div.innerHTML = `<p>Pedido #${pedido.id}: $${pedido.total} - ${pedido.status}</p><button onclick="markAsAttended(${pedido.id})">Completar</button>`;
            pedidosList.appendChild(div);
        });
    }
}

async function markAsAttended(orderId) {
    try {
        const response = await fetch(`${API_URL}/orders/${orderId}/`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken') // Incluir token CSRF para PATCH
            },
            body: JSON.stringify({ status: 'ATENDIDO' }),
            credentials: 'include',
        });

        if (response.ok) {
            fetchOrders();
        } else {
            alert('Error al actualizar el estado.');
        }
    } catch (error) {
        console.error('Error marking order as attended:', error);
    }
}

function logout() {
    // Limpiar cualquier dato de sesión en el cliente (si lo hubiera)
    localStorage.clear(); // Opcional: limpia localStorage si estás guardando algo como un token
    sessionStorage.clear(); // Opcional: limpia sessionStorage si lo usas

    // Redirigir al inicio de la aplicación
    window.location.href = '/'; // Esto te lleva a la raíz (index.html)
    // Si prefieres redirigir a menus.html, usa:
    // window.location.href = '/menus.html';
}