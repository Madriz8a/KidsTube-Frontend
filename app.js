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

// Verificar autenticación cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('dashboard.html')) {
        checkAuth();
    }
});