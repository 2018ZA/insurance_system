// Файл для управления аутентификацией

const AuthManager = {
    init: function() {
        this.initLoginForm();
        this.initPasswordToggle();
        this.initRememberMe();
        this.checkAuthStatus();
    },
    
    initLoginForm: function() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;
        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            const data = {
                username: formData.get('username'),
                password: formData.get('password'),
                rememberMe: formData.get('remember-me') === 'on'
            };
            
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    window.location.href = '/';
                } else {
                    this.showLoginError('Неверный логин или пароль');
                }
            } catch (error) {
                this.showLoginError('Ошибка сети. Проверьте подключение.');
            }
        });
    },
    
    initPasswordToggle: function() {
        const toggleButtons = document.querySelectorAll('.password-toggle');
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const input = this.previousElementSibling;
                const icon = this.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    },
    
    initRememberMe: function() {
        const rememberCheckbox = document.getElementById('rememberMe');
        if (!rememberCheckbox) return;
        
        const savedUsername = localStorage.getItem('rememberedUsername');
        if (savedUsername) {
            document.getElementById('username').value = savedUsername;
            rememberCheckbox.checked = true;
        }
        
        rememberCheckbox.addEventListener('change', function() {
            const usernameInput = document.getElementById('username');
            if (this.checked && usernameInput.value) {
                localStorage.setItem('rememberedUsername', usernameInput.value);
            } else {
                localStorage.removeItem('rememberedUsername');
            }
        });
    },
    
    showLoginError: function(message) {
        let errorDiv = document.querySelector('.login-error');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger login-error';
            const form = document.getElementById('loginForm');
            form.parentNode.insertBefore(errorDiv, form);
        }
        
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            ${message}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;
        
        // Анимация ошибки
        errorDiv.classList.remove('show');
        setTimeout(() => errorDiv.classList.add('show'), 10);
    },
    
    checkAuthStatus: function() {
        // Проверяем наличие токена аутентификации
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        
        if (token && window.location.pathname.includes('/login')) {
            // Пользователь уже авторизован, перенаправляем на главную
            window.location.href = '/';
        }
    },
    
    logout: function() {
        fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => {
            // Очищаем локальное хранилище
            localStorage.removeItem('authToken');
            localStorage.removeItem('rememberedUsername');
            sessionStorage.removeItem('authToken');
            
            // Перенаправляем на страницу входа
            window.location.href = '/login?logout=true';
        });
    },
    
    resetPassword: function() {
        const email = prompt('Введите email для сброса пароля:');
        if (!email) return;
        
        if (!this.validateEmail(email)) {
            alert('Пожалуйста, введите корректный email адрес');
            return;
        }
        
        fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        }).then(response => {
            if (response.ok) {
                alert('Инструкции по сбросу пароля отправлены на ваш email');
            } else {
                alert('Ошибка при отправке запроса на сброс пароля');
            }
        });
    },
    
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    AuthManager.init();
    
    // Показываем сообщения об ошибках из параметров URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('error')) {
        AuthManager.showLoginError('Неверный логин или пароль');
    }
    
    if (urlParams.has('expired')) {
        AuthManager.showLoginError('Сессия истекла. Пожалуйста, войдите снова.');
    }
    
    if (urlParams.has('logout')) {
        showNotification('success', 'Вы успешно вышли из системы');
    }
});