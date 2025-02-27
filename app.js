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