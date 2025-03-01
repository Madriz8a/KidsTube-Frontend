const API_URL = 'http://localhost:3000/api';

// Función para registrar un usuario
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const repeatPassword = document.getElementById('repeatPassword').value;
    const phone = document.getElementById('phone').value;
    const pin = document.getElementById('pin').value;
    const name = document.getElementById('name').value;
    const lastName = document.getElementById('lastName').value;
    const country = document.getElementById('country').value;
    const birthdate = document.getElementById('birthdate').value;

    // Validaciones del frontend
    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    if (password !== repeatPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    const userData = {
        email,
        password,
        repeat_password: repeatPassword,
        phone_number: phone,
        pin,
        name,
        last_name: lastName,
        country,
        birthdate,
        state: false
    };

    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'register': 'true'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            alert('Registro exitoso. Por favor, revisa tu correo para confirmar.');
            window.location.href = 'login.html';
        } else {
            const error = await response.json();
            alert(`Error: ${error.error}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Función para iniciar sesión
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token); // Guardar el token en localStorage
            window.location.href = 'dashboard.html';
        } else {
            const error = await response.json();
            alert(`Error: ${error.error}`); // Mostrar el mensaje de error del servidor
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Función para verificar si hay un token válido
const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        // No hay token, redirigir a login
        window.location.href = 'login.html';
        return false;
    }
    
    try {
        // Verificar validez del token haciendo una solicitud al API
        const response = await fetch(`${API_URL}/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            // Token inválido o expirado
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error validando token:', error);
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        return false;
    }
};

// Función para cerrar sesión
document.getElementById('logoutButton')?.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
        try {
            const response = await fetch(`${API_URL}/session`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log('Sesión eliminada correctamente');
            } else {
                console.error('Error al eliminar la sesión');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    localStorage.removeItem('token'); // Eliminar el token
    window.location.href = 'login.html';
});

// Función para decodificar el token JWT
const decodeToken = (token) => {
    try {
        // El token JWT tiene tres partes: header.payload.signature
        // Tomamos la parte del payload (segunda parte) y la decodificamos
        const payload = token.split('.')[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decodificando token:', error);
        return null;
    }
};

// Función para obtener los datos del usuario actual
const getCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    // Decodificar el token para obtener el ID del usuario
    const decodedToken = decodeToken(token);
    if (!decodedToken || !decodedToken.id) return null;
    
    try {
        const response = await fetch(`${API_URL}/users?id=${decodedToken.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Error obteniendo datos del usuario');
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};

// Función para cargar datos del usuario en el dashboard
const loadDashboardUserInfo = async () => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;
    
    const user = await getCurrentUser();
    if (!user) return;
    
    // Actualizar elementos del DOM con información del usuario
    const userDisplayName = document.getElementById('userDisplayName');
    const profileName = document.getElementById('profileName');
    
    if (profileName) profileName.textContent = `${user.name || ''} ${user.last_name || ''}`;
};

// Verificar autenticación cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('dashboard.html')) {
        checkAuth();
    }
});

// Verificación de autenticación y carga de datos según la página actual
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('dashboard.html')) {
        loadDashboardUserInfo();
    }
});