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

// Función para cargar el perfil del usuario en la página de edición
const loadUserProfile = async () => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;
    
    const user = await getCurrentUser();
    if (!user) return;
    
    // Llenar el formulario con los datos actuales del usuario
    document.getElementById('name').value = user.name || '';
    document.getElementById('lastName').value = user.last_name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone_number || '';
    document.getElementById('country').value = user.country || '';
    document.getElementById('birthdate').value = user.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : '';
};

// Función para actualizar el perfil del usuario
const updateUserProfile = async (userData) => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Decodificar el token para obtener el ID del usuario
    const decodedToken = decodeToken(token);
    if (!decodedToken || !decodedToken.id) return false;
    
    try {
        const response = await fetch(`${API_URL}/users?id=${decodedToken.id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        return response.ok;
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        return false;
    }
};

// Manejo del formulario de actualización de perfil
document.getElementById('updateProfileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const lastName = document.getElementById('lastName').value;
    const phone = document.getElementById('phone').value;
    const country = document.getElementById('country').value;
    const birthdate = document.getElementById('birthdate').value;
    
    const userData = {
        name,
        last_name: lastName,
        phone_number: phone,
        country,
        birthdate
    };
    
    // Verificar si se está intentando cambiar la contraseña
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const repeatNewPassword = document.getElementById('repeatNewPassword').value;
    
    if (currentPassword || newPassword || repeatNewPassword) {
        // Si se está intentando cambiar la contraseña, verificar que todos los campos estén completos
        if (!currentPassword || !newPassword || !repeatNewPassword) {
            alert('Para cambiar la contraseña, todos los campos de contraseña deben estar completos');
            return;
        }
        
        // Verificar que las nuevas contraseñas coincidan
        if (newPassword !== repeatNewPassword) {
            alert('Las nuevas contraseñas no coinciden');
            return;
        }
        
        // Verificar longitud mínima
        if (newPassword.length < 6) {
            alert('La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }
        
        userData.password = newPassword;
        userData.repeat_password = repeatNewPassword;
    }
    
    const success = await updateUserProfile(userData);
    if (success) {
        alert('Perfil actualizado correctamente');
        window.location.href = 'dashboard.html';
    } else {
        alert('Error al actualizar el perfil');
    }
});

// Actualizar la verificación para cargar el perfil cuando se está en la página profile.html
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('dashboard.html')) {
        loadDashboardUserInfo();
    } else if (currentPage.includes('profile.html')) {
        loadUserProfile();
    }
});

// Verificación de autenticación y carga de datos según la página actual
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('dashboard.html')) {
        loadDashboardUserInfo();
    }
});