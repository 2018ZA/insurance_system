// Файл для управления клиентами

const ClientManager = {
    currentPage: 1,
    pageSize: 10,
    currentSort: { field: 'fullName', direction: 'asc' },
    currentFilters: {},
    
    init: function() {
        this.initTable();
        this.initFilters();
        this.initSearch();
        this.initClientForm();
        this.initQuickActions();
    },
    
    initTable: function() {
        this.loadClients();
        
        // Обработка сортировки
        document.querySelectorAll('[data-sort]').forEach(header => {
            header.addEventListener('click', (e) => {
                const field = e.currentTarget.dataset.sort;
                this.sortClients(field);
            });
        });
        
        // Обработка пагинации
        document.querySelectorAll('[data-page]').forEach(button => {
            button.addEventListener('click', (e) => {
                const page = parseInt(e.currentTarget.dataset.page);
                this.goToPage(page);
            });
        });
    },
    
    initFilters: function() {
        const filterForm = document.getElementById('filterForm');
        if (!filterForm) return;
        
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.applyFilters(new FormData(filterForm));
        });
        
        // Сброс фильтров
        const resetButton = filterForm.querySelector('[type="reset"]');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.clearFilters();
            });
        }
    },
    
    initSearch: function() {
        const searchInput = document.getElementById('clientSearch');
        if (!searchInput) return;
        
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.searchClients(e.target.value);
            }, 300);
        });
    },
    
    initClientForm: function() {
        const form = document.getElementById('clientForm');
        if (!form) return;
        
        // Валидация телефона
        const phoneInput = form.querySelector('[name="phone"]');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
        }
        
        // Валидация паспортных данных
        const passportSeries = form.querySelector('[name="passportSeries"]');
        if (passportSeries) {
            passportSeries.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
            });
        }
        
        const passportNumber = form.querySelector('[name="passportNumber"]');
        if (passportNumber) {
            passportNumber.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 6);
            });
        }
        
        // Проверка уникальности телефона
        if (phoneInput && !form.dataset.clientId) {
            phoneInput.addEventListener('blur', (e) => {
                this.checkPhoneUniqueness(e.target.value);
            });
        }
    },
    
    initQuickActions: function() {
        // Быстрое добавление клиента
        const quickAddBtn = document.getElementById('quickAddClient');
        if (quickAddBtn) {
            quickAddBtn.addEventListener('click', () => {
                this.showQuickAddModal();
            });
        }
        
        // Экспорт клиентов
        const exportBtn = document.getElementById('exportClients');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportClients();
            });
        }
        
        // Массовые действия
        const massActionSelect = document.getElementById('massAction');
        if (massActionSelect) {
            massActionSelect.addEventListener('change', (e) => {
                this.handleMassAction(e.target.value);
            });
        }
    },
    
    loadClients: function() {
        const params = new URLSearchParams({
            page: this.currentPage,
            size: this.pageSize,
            sort: `${this.currentSort.field},${this.currentSort.direction}`,
            ...this.currentFilters
        });
        
        fetch(`/api/clients?${params}`)
            .then(response => response.json())
            .then(data => {
                this.renderClientsTable(data.content);
                this.renderPagination(data);
            })
            .catch(error => {
                console.error('Error loading clients:', error);
                showNotification('error', 'Ошибка загрузки клиентов');
            });
    },
    
    renderClientsTable: function(clients) {
        const tbody = document.querySelector('#clientsTable tbody');
        if (!tbody) return;
        
        if (clients.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-5">
                        <i class="fas fa-users fa-3x text-muted mb-3"></i>
                        <p class="text-muted">Клиенты не найдены</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = clients.map(client => `
            <tr data-client-id="${client.id}">
                <td>
                    <input type="checkbox" class="form-check-input client-checkbox" value="${client.id}">
                </td>
                <td>
                    <a href="/clients/${client.id}" class="text-decoration-none">
                        ${client.fullName}
                    </a>
                </td>
                <td>
                    ${client.passportSeries && client.passportNumber ? 
                      `${client.passportSeries} ${client.passportNumber}` : 
                      '<span class="text-muted">Не указано</span>'}
                </td>
                <td>
                    <a href="tel:${client.phone}" class="text-decoration-none">
                        ${Formatter.formatPhone(client.phone)}
                    </a>
                </td>
                <td>
                    ${client.email ? 
                      `<a href="mailto:${client.email}" class="text-decoration-none">${client.email}</a>` : 
                      '<span class="text-muted">Не указан</span>'}
                </td>
                <td>${Formatter.formatDate(client.registrationDate)}</td>
                <td>
                    <span class="badge bg-${client.active ? 'success' : 'secondary'}">
                        ${client.active ? 'Активен' : 'Неактивен'}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <a href="/clients/${client.id}" class="btn btn-info" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </a>
                        <a href="/clients/${client.id}/edit" class="btn btn-warning" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </a>
                        <button class="btn btn-danger" title="Удалить" 
                                onclick="ClientManager.deleteClient(${client.id}, '${client.fullName}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    renderPagination: function(data) {
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;
        
        const totalPages = data.totalPages;
        const currentPage = data.number + 1;
        
        let html = '';
        
        // Кнопка "Назад"
        html += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <button class="page-link" data-page="${currentPage - 1}">
                    <i class="fas fa-chevron-left"></i>
                </button>
            </li>
        `;
        
        // Номера страниц
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <button class="page-link" data-page="${i}">${i}</button>
                </li>
            `;
        }
        
        // Кнопка "Вперед"
        html += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <button class="page-link" data-page="${currentPage + 1}">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </li>
        `;
        
        pagination.innerHTML = html;
        
        // Обновляем обработчики событий
        document.querySelectorAll('.pagination .page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.currentTarget.dataset.page);
                if (page >= 1 && page <= totalPages) {
                    this.goToPage(page);
                }
            });
        });
    },
    
    goToPage: function(page) {
        this.currentPage = page;
        this.loadClients();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    sortClients: function(field) {
        if (this.currentSort.field === field) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.field = field;
            this.currentSort.direction = 'asc';
        }
        
        this.loadClients();
    },
    
    applyFilters: function(formData) {
        this.currentFilters = {};
        formData.forEach((value, key) => {
            if (value) {
                this.currentFilters[key] = value;
            }
        });
        
        this.currentPage = 1;
        this.loadClients();
    },
    
    clearFilters: function() {
        this.currentFilters = {};
        this.currentPage = 1;
        this.loadClients();
        
        // Очищаем форму фильтров
        const filterForm = document.getElementById('filterForm');
        if (filterForm) {
            filterForm.reset();
        }
    },
    
    searchClients: function(query) {
        if (query.length >= 2) {
            this.currentFilters.search = query;
        } else {
            delete this.currentFilters.search;
        }
        
        this.currentPage = 1;
        this.loadClients();
    },
    
    formatPhoneNumber: function(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.startsWith('7') || value.startsWith('8')) {
            value = '+7' + value.substring(1);
        } else if (value.length > 0) {
            value = '+7' + value;
        }
        
        input.value = value.substring(0, 12);
    },
    
    checkPhoneUniqueness: function(phone) {
        if (!phone || phone.length < 10) return;
        
        fetch(`/api/clients/check-phone?phone=${encodeURIComponent(phone)}`)
            .then(response => response.json())
            .then(data => {
                if (data.exists) {
                    showNotification('warning', 'Клиент с таким телефоном уже существует');
                }
            })
            .catch(error => console.error('Error checking phone:', error));
    },
    
    deleteClient: function(clientId, clientName) {
        if (!confirm(`Вы уверены, что хотите удалить клиента "${clientName}"?`)) {
            return;
        }
        
        fetch(`/api/clients/${clientId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]')?.content
            }
        })
        .then(response => {
            if (response.ok) {
                showNotification('success', `Клиент "${clientName}" успешно удален`);
                this.loadClients();
            } else {
                response.json().then(data => {
                    showNotification('error', data.message || 'Ошибка при удалении клиента');
                });
            }
        })
        .catch(error => {
            console.error('Error deleting client:', error);
            showNotification('error', 'Ошибка при удалении клиента');
        });
    },
    
    showQuickAddModal: function() {
        // Создаем и показываем модальное окно для быстрого добавления
        const modalHtml = `
            <div class="modal fade" id="quickAddModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Быстрое добавление клиента</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="quickClientForm">
                                <div class="mb-3">
                                    <label for="quickFullName" class="form-label">ФИО *</label>
                                    <input type="text" class="form-control" id="quickFullName" required>
                                </div>
                                <div class="mb-3">
                                    <label for="quickPhone" class="form-label">Телефон *</label>
                                    <input type="tel" class="form-control" id="quickPhone" required>
                                </div>
                                <div class="mb-3">
                                    <label for="quickEmail" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="quickEmail">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="btn btn-primary" onclick="ClientManager.saveQuickClient()">
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Удаляем предыдущее модальное окно, если есть
        const existingModal = document.getElementById('quickAddModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Добавляем новое модальное окно
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Показываем модальное окно
        const modal = new bootstrap.Modal(document.getElementById('quickAddModal'));
        modal.show();
        
        // Настраиваем форматирование телефона
        const phoneInput = document.getElementById('quickPhone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
        }
    },
    
    saveQuickClient: function() {
        const form = document.getElementById('quickClientForm');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        const clientData = {
            fullName: document.getElementById('quickFullName').value,
            phone: document.getElementById('quickPhone').value,
            email: document.getElementById('quickEmail').value || null
        };
        
        fetch('/api/clients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]')?.content
            },
            body: JSON.stringify(clientData)
        })
        .then(response => response.json())
        .then(client => {
            showNotification('success', `Клиент "${client.fullName}" успешно добавлен`);
            
            // Закрываем модальное окно
            const modal = bootstrap.Modal.getInstance(document.getElementById('quickAddModal'));
            modal.hide();
            
            // Обновляем таблицу клиентов
            this.loadClients();
            
            // Очищаем форму
            form.reset();
            form.classList.remove('was-validated');
        })
        .catch(error => {
            console.error('Error saving client:', error);
            showNotification('error', 'Ошибка при добавлении клиента');
        });
    },
    
    exportClients: function() {
        const params = new URLSearchParams({
            ...this.currentFilters,
            sort: `${this.currentSort.field},${this.currentSort.direction}`
        });
        
        window.open(`/api/clients/export?${params}`, '_blank');
    },
    
    handleMassAction: function(action) {
        const selectedIds = this.getSelectedClientIds();
        if (selectedIds.length === 0) {
            showNotification('warning', 'Выберите хотя бы одного клиента');
            return;
        }
        
        switch(action) {
            case 'export':
                this.exportSelectedClients(selectedIds);
                break;
            case 'deactivate':
                this.deactivateClients(selectedIds);
                break;
            case 'activate':
                this.activateClients(selectedIds);
                break;
            case 'delete':
                this.deleteSelectedClients(selectedIds);
                break;
        }
        
        // Сбрасываем выбор действия
        document.getElementById('massAction').value = '';
    },
    
    getSelectedClientIds: function() {
        const checkboxes = document.querySelectorAll('.client-checkbox:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    },
    
    exportSelectedClients: function(ids) {
        const params = new URLSearchParams({ ids: ids.join(',') });
        window.open(`/api/clients/export-selected?${params}`, '_blank');
    },
    
    deactivateClients: function(ids) {
        if (!confirm(`Деактивировать выбранных клиентов (${ids.length})?`)) return;
        
        fetch('/api/clients/deactivate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]')?.content
            },
            body: JSON.stringify({ ids })
        })
        .then(response => {
            if (response.ok) {
                showNotification('success', 'Клиенты деактивированы');
                this.loadClients();
            }
        });
    },
    
    activateClients: function(ids) {
        fetch('/api/clients/activate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]')?.content
            },
            body: JSON.stringify({ ids })
        })
        .then(response => {
            if (response.ok) {
                showNotification('success', 'Клиенты активированы');
                this.loadClients();
            }
        });
    },
    
    deleteSelectedClients: function(ids) {
        if (!confirm(`Удалить выбранных клиентов (${ids.length})? Это действие нельзя отменить.`)) return;
        
        fetch('/api/clients/delete-selected', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]')?.content
            },
            body: JSON.stringify({ ids })
        })
        .then(response => {
            if (response.ok) {
                showNotification('success', 'Клиенты удалены');
                this.loadClients();
            }
        });
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('#clientsTable')) {
        ClientManager.init();
    }
});