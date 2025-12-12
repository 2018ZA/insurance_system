// Основной файл JavaScript для приложения InsurancePro

// Конфигурация приложения
const AppConfig = {
    API_BASE_URL: '/api',
    DEBOUNCE_DELAY: 300,
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 минут
    DATE_FORMAT: 'dd.MM.yyyy',
    CURRENCY_SYMBOL: '₽'
};

// Утилиты для форматирования
const Formatter = {
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount) + ' ' + AppConfig.CURRENCY_SYMBOL;
    },
    
    formatDate: function(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    },
    
    formatDateTime: function(dateTimeString) {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return date.toLocaleString('ru-RU');
    },
    
    formatPhone: function(phone) {
        if (!phone) return '';
        // Формат: +7 (999) 123-45-67
        return phone.replace(/^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/, '+7 ($1) $2-$3-$4');
    },
    
    truncateText: function(text, maxLength = 100) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
};

// Менеджер сессии
const SessionManager = {
    lastActivity: Date.now(),
    
    init: function() {
        // Отслеживание активности пользователя
        document.addEventListener('mousemove', this.updateActivity.bind(this));
        document.addEventListener('keypress', this.updateActivity.bind(this));
        document.addEventListener('click', this.updateActivity.bind(this));
        
        // Проверка сессии каждую минуту
        setInterval(this.checkSession.bind(this), 60000);
    },
    
    updateActivity: function() {
        this.lastActivity = Date.now();
    },
    
    checkSession: function() {
        const now = Date.now();
        const inactiveTime = now - this.lastActivity;
        
        if (inactiveTime > AppConfig.SESSION_TIMEOUT) {
            this.showSessionWarning();
        }
    },
    
    showSessionWarning: function() {
        if (document.querySelector('#sessionWarning')) return;
        
        const warning = document.createElement('div');
        warning.id = 'sessionWarning';
        warning.className = 'alert alert-warning alert-dismissible fade show position-fixed';
        warning.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
        warning.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <strong>Сессия скоро истечет!</strong>
            <p>Ваша сессия будет автоматически завершена через 5 минут из-за неактивности.</p>
            <button type="button" class="btn btn-sm btn-outline-warning" onclick="SessionManager.extendSession()">
                <i class="fas fa-sync-alt"></i> Продлить сессию
            </button>
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;
        
        document.body.appendChild(warning);
        
        // Автоматическое скрытие через 5 минут
        setTimeout(() => {
            if (warning.parentElement) {
                warning.remove();
                this.logout();
            }
        }, 5 * 60 * 1000);
    },
    
    extendSession: function() {
        this.lastActivity = Date.now();
        const warning = document.querySelector('#sessionWarning');
        if (warning) {
            warning.remove();
        }
        
        // Отправка запроса на продление сессии
        fetch('/api/session/extend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]')?.content
            }
        }).then(response => {
            if (response.ok) {
                showNotification('success', 'Сессия продлена');
            }
        });
    },
    
    logout: function() {
        fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => {
            window.location.href = '/login?expired=true';
        });
    }
};

// Менеджер уведомлений
const NotificationManager = {
    show: function(type, message, options = {}) {
        const config = {
            duration: 5000,
            position: 'top-right',
            ...options
        };
        
        const notification = document.createElement('div');
        notification.className = `notification alert alert-${type} alert-dismissible fade show`;
        notification.style.cssText = `
            position: fixed;
            ${config.position.includes('top') ? 'top: 20px;' : 'bottom: 20px;'}
            ${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
            z-index: 9999;
            min-width: 300px;
            max-width: 500px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        const icon = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        }[type] || 'fa-info-circle';
        
        notification.innerHTML = `
            <div class="d-flex align-items-start">
                <div class="flex-shrink-0">
                    <i class="fas ${icon} fa-lg"></i>
                </div>
                <div class="flex-grow-1 ms-3">
                    <div class="notification-message">${message}</div>
                </div>
                <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Автоматическое закрытие
        if (config.duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.classList.remove('show');
                    setTimeout(() => notification.remove(), 150);
                }
            }, config.duration);
        }
    },
    
    success: function(message, options) {
        this.show('success', message, options);
    },
    
    error: function(message, options) {
        this.show('error', message, options);
    },
    
    warning: function(message, options) {
        this.show('warning', message, options);
    },
    
    info: function(message, options) {
        this.show('info', message, options);
    }
};

// API клиент
const ApiClient = {
    get: async function(endpoint, params = {}) {
        const url = new URL(AppConfig.API_BASE_URL + endpoint, window.location.origin);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        
        try {
            const response = await fetch(url, {
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    },
    
    post: async function(endpoint, data = {}) {
        try {
            const response = await fetch(AppConfig.API_BASE_URL + endpoint, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            return await this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    },
    
    put: async function(endpoint, data = {}) {
        try {
            const response = await fetch(AppConfig.API_BASE_URL + endpoint, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            return await this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    },
    
    delete: async function(endpoint) {
        try {
            const response = await fetch(AppConfig.API_BASE_URL + endpoint, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    },
    
    getHeaders: function() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
        const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;
        
        if (csrfToken && csrfHeader) {
            headers[csrfHeader] = csrfToken;
        }
        
        return headers;
    },
    
    handleResponse: async function(response) {
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`HTTP ${response.status}: ${error}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        return await response.text();
    },
    
    handleError: function(error) {
        console.error('API Error:', error);
        NotificationManager.error(`Ошибка API: ${error.message}`);
    }
};

// Поиск с дебаунсом
const SearchManager = {
    debounceTimer: null,
    
    search: function(inputId, endpoint, callback) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        input.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimer);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                callback([]);
                return;
            }
            
            this.debounceTimer = setTimeout(() => {
                this.performSearch(endpoint, query, callback);
            }, AppConfig.DEBOUCE_DELAY);
        });
    },
    
    performSearch: async function(endpoint, query, callback) {
        try {
            const results = await ApiClient.get(endpoint, { q: query });
            callback(results);
        } catch (error) {
            console.error('Search error:', error);
            callback([]);
        }
    }
};

// Валидация форм
const FormValidator = {
    patterns: {
        phone: /^\+7\d{10}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        passportSeries: /^\d{4}$/,
        passportNumber: /^\d{6}$/,
        inn: /^\d{10,12}$/,
        snils: /^\d{3}-\d{3}-\d{3}\s\d{2}$/
    },
    
    messages: {
        required: 'Это поле обязательно для заполнения',
        phone: 'Введите телефон в формате +79991234567',
        email: 'Введите корректный email адрес',
        passportSeries: 'Серия паспорта должна содержать 4 цифры',
        passportNumber: 'Номер паспорта должен содержать 6 цифр',
        minLength: 'Минимальная длина: {min} символов',
        maxLength: 'Максимальная длина: {max} символов',
        number: 'Введите число',
        min: 'Минимальное значение: {min}',
        max: 'Максимальное значение: {max}'
    },
    
    validateField: function(field) {
        const value = field.value.trim();
        const constraints = field.dataset;
        
        // Проверка обязательного поля
        if (field.required && !value) {
            return this.getMessage('required');
        }
        
        // Проверка паттерна
        if (constraints.pattern && value) {
            const pattern = this.patterns[constraints.pattern];
            if (pattern && !pattern.test(value)) {
                return this.getMessage(constraints.pattern);
            }
        }
        
        // Проверка минимальной длины
        if (constraints.minLength && value.length < parseInt(constraints.minLength)) {
            return this.getMessage('minLength', { min: constraints.minLength });
        }
        
        // Проверка максимальной длины
        if (constraints.maxLength && value.length > parseInt(constraints.maxLength)) {
            return this.getMessage('maxLength', { max: constraints.maxLength });
        }
        
        // Проверка числового значения
        if (constraints.number && value && isNaN(value)) {
            return this.getMessage('number');
        }
        
        // Проверка минимального значения
        if (constraints.min && value && parseFloat(value) < parseFloat(constraints.min)) {
            return this.getMessage('min', { min: constraints.min });
        }
        
        // Проверка максимального значения
        if (constraints.max && value && parseFloat(value) > parseFloat(constraints.max)) {
            return this.getMessage('max', { max: constraints.max });
        }
        
        return null; // Валидация пройдена
    },
    
    validateForm: function(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;
        
        let isValid = true;
        const fields = form.querySelectorAll('[data-validate]');
        
        fields.forEach(field => {
            const error = this.validateField(field);
            const feedback = field.parentElement.querySelector('.invalid-feedback') || 
                           this.createFeedbackElement(field);
            
            if (error) {
                field.classList.add('is-invalid');
                field.classList.remove('is-valid');
                feedback.textContent = error;
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
                field.classList.add('is-valid');
                feedback.textContent = '';
            }
        });
        
        return isValid;
    },
    
    createFeedbackElement: function(field) {
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        field.parentElement.appendChild(feedback);
        return feedback;
    },
    
    getMessage: function(key, params = {}) {
        let message = this.messages[key] || 'Неверное значение';
        Object.keys(params).forEach(param => {
            message = message.replace(`{${param}}`, params[param]);
        });
        return message;
    },
    
    initForm: function(formId, onSubmit) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (this.validateForm(formId)) {
                onSubmit(form);
            } else {
                const firstInvalid = form.querySelector('.is-invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                }
            }
        });
        
        // Валидация при потере фокуса
        const fields = form.querySelectorAll('[data-validate]');
        fields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
            
            field.addEventListener('input', () => {
                field.classList.remove('is-invalid', 'is-valid');
            });
        });
    }
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация менеджера сессии
    SessionManager.init();
    
    // Инициализация Bootstrap компонентов
    initBootstrapComponents();
    
    // Инициализация таблиц с DataTables (если подключена библиотека)
    initDataTables();
    
    // Инициализация календарей
    initDatePickers();
    
    // Подключение обработчиков событий
    attachEventHandlers();
    
    // Загрузка начальных данных
    loadInitialData();
});

function initBootstrapComponents() {
    // Инициализация всплывающих подсказок
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Инициализация выпадающих меню
    const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
    dropdownElementList.map(function (dropdownToggleEl) {
        return new bootstrap.Dropdown(dropdownToggleEl);
    });
    
    // Инициализация модальных окон
    const modalElementList = [].slice.call(document.querySelectorAll('.modal'));
    modalElementList.map(function (modalEl) {
        return new bootstrap.Modal(modalEl);
    });
}

function initDataTables() {
    if (typeof $.fn.DataTable !== 'undefined') {
        $('.datatable').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Russian.json'
            },
            pageLength: 25,
            responsive: true,
            order: [[0, 'desc']]
        });
    }
}

function initDatePickers() {
    if (typeof flatpickr !== 'undefined') {
        flatpickr('.datepicker', {
            dateFormat: 'd.m.Y',
            locale: 'ru'
        });
    }
}

function attachEventHandlers() {
    // Обработка подтверждения удаления
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-confirm]')) {
            const message = e.target.getAttribute('data-confirm') || 
                           'Вы уверены, что хотите выполнить это действие?';
            
            if (!confirm(message)) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
    });
    
    // Обработка форм с подтверждением
    document.addEventListener('submit', function(e) {
        const form = e.target;
        if (form.hasAttribute('data-confirm-submit')) {
            const message = form.getAttribute('data-confirm-submit');
            if (!confirm(message)) {
                e.preventDefault();
            }
        }
    });
    
    // Копирование в буфер обмена
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-copy]')) {
            const text = e.target.getAttribute('data-copy');
            navigator.clipboard.writeText(text).then(() => {
                NotificationManager.success('Скопировано в буфер обмена');
            });
        }
    });
}

function loadInitialData() {
    // Загрузка статистики для главной страницы
    if (document.querySelector('.stats-container')) {
        ApiClient.get('/statistics/summary').then(data => {
            updateStatsDisplay(data);
        });
    }
    
    // Загрузка уведомлений
    if (document.querySelector('.notifications-container')) {
        ApiClient.get('/notifications').then(notifications => {
            renderNotifications(notifications);
        });
    }
}

function updateStatsDisplay(stats) {
    // Обновление отображения статистики на странице
    Object.keys(stats).forEach(key => {
        const element = document.querySelector(`[data-stat="${key}"]`);
        if (element) {
            element.textContent = Formatter.formatCurrency(stats[key]);
        }
    });
}

function renderNotifications(notifications) {
    const container = document.querySelector('.notifications-container');
    if (!container || !notifications.length) return;
    
    container.innerHTML = notifications.map(notification => `
        <div class="notification-item alert alert-${notification.type}">
            <i class="fas ${getNotificationIcon(notification.type)}"></i>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${Formatter.formatDateTime(notification.createdAt)}</div>
            </div>
            <button type="button" class="btn-close" onclick="markAsRead('${notification.id}')"></button>
        </div>
    `).join('');
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || 'fa-info-circle';
}

function markAsRead(notificationId) {
    ApiClient.post(`/notifications/${notificationId}/read`).then(() => {
        document.querySelector(`[data-notification="${notificationId}"]`)?.remove();
    });
}

// Глобальные функции для использования в HTML
window.showNotification = NotificationManager.show.bind(NotificationManager);
window.confirmDelete = function(message, url) {
    if (confirm(message || 'Вы уверены, что хотите удалить эту запись?')) {
        window.location.href = url;
    }
};