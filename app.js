const API_URL = 'http://localhost:3000/api';

// Función para registrar un usuario
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const repeatPassword = document.getElementById('repeatPassword').value;
    const name = document.getElementById('name').value;
    const lastName = document.getElementById('lastName').value;

    // Validaciones básicas
    if (password !== repeatPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    const userData = {
        email,
        password,
        repeat_password: repeatPassword,
        name,
        last_name: lastName
    };

    try {
        alert('Función de registro aún no implementada');
        // Aquí se implementará la llamada a la API
    } catch (error) {
        console.error('Error:', error);
    }
});

// Función para iniciar sesión
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    alert('Función de login aún no implementada');
    // Aquí se implementará la llamada a la API
});