// Файл для управления договорами

const ContractManager = {
    currentPage: 1,
    pageSize: 10,
    currentSort: { field: 'createdAt', direction: 'desc' },
    currentFilters: {},
    
    init: function() {
        this.initTable();
        this.initFilters();
        this.initContractForm();
        this.initStatusManagement();
        this.initPaymentProcessing();
        this.initClaimsManagement();
        this.initExportOptions();
    },
    
    initTable: function() {
        this.loadContracts();
        
        // Обработка сортировки
        document.querySelectorAll('[data-sort]').forEach(header => {
            header.addEventListener('click', (e) => {
                const field = e.currentTarget.dataset.sort;
                this.sortContracts(field);
            });
        });
    },
    
    initFilters: function() {
        const filterForm = document.getElementById('filterForm');
        if (!filterForm) return;
        
        // Инициализация datepicker
        this.initDatePickers();
        
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.applyFilters(new FormData(filterForm));
        });
        
        // Сброс фильтров
        const resetButton = document.getElementById('resetFilters');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.clearFilters();
            });
        }
        
        // Фильтр по статусу
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.applyFilters(new FormData(filterForm));
            });
        }
        
        // Фильтр по типу страхования
        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', () => {
                this.applyFilters(new FormData(filterForm));
            });
        }
    },
    
    initDatePickers: function() {
        if (typeof flatpickr !== 'undefined') {
            // Период действия
            const periodPicker = document.getElementById('periodPicker');
            if (periodPicker) {
                flatpickr(periodPicker, {
                    mode: 'range',
                    dateFormat: 'd.m.Y',
                    locale: 'ru'
                });
            }
            
            // Дата начала
            const startDatePicker = document.getElementById('startDateFilter');
            if (startDatePicker) {
                flatpickr(startDatePicker, {
                    dateFormat: 'd.m.Y',
                    locale: 'ru'
                });
            }
            
            // Дата окончания
            const endDatePicker = document.getElementById('endDateFilter');
            if (endDatePicker) {
                flatpickr(endDatePicker, {
                    dateFormat: 'd.m.Y',
                    locale: 'ru'
                });
            }
        }
    },
    
    initContractForm: function() {
        const form = document.getElementById('contractForm');
        if (!form) return;
        
        // Расчет страховой премии
        const insuredAmountInput = form.querySelector('[name="insuredAmount"]');
        const premiumAmountInput = form.querySelector('[name="premiumAmount"]');
        const insuranceTypeSelect = form.querySelector('[name="insuranceTypeCode"]');
        
        if (insuredAmountInput && premiumAmountInput && insuranceTypeSelect) {
            insuredAmountInput.addEventListener('blur', () => {
                this.calculatePremium();
            });
            
            insuranceTypeSelect.addEventListener('change', () => {
                this.calculatePremium();
            });
        }
        
        // Валидация дат
        const startDateInput = form.querySelector('[name="startDate"]');
        const endDateInput = form.querySelector('[name="endDate"]');
        
        if (startDateInput && endDateInput) {
            startDateInput.addEventListener('change', () => {
                this.validateDates();
            });
            
            endDateInput.addEventListener('change', () => {
                this.validateDates();
            });
        }
        
        // Динамические поля в зависимости от типа страхования
        if (insuranceTypeSelect) {
            insuranceTypeSelect.addEventListener('change', (e) => {
                this.showAdditionalFields(e.target.value);
            });
            
            // Инициализация полей при загрузке
            if (insuranceTypeSelect.value) {
                this.showAdditionalFields(insuranceTypeSelect.value);
            }
        }
        
        // Проверка уникальности номера договора
        const contractNumberInput = form.querySelector('[name="contractNumber"]');
        if (contractNumberInput) {
            contractNumberInput.addEventListener('blur', (e) => {
                this.checkContractNumberUniqueness(e.target.value);
            });
        }
    },
    
    initStatusManagement: function() {
        // Быстрое изменение статуса
        document.addEventListener('click', (e) => {
            if (e.target.matches('.status-change-btn')) {
                const contractId = e.target.dataset.contractId;
                const newStatus = e.target.dataset.status;
                this.changeContractStatus(contractId, newStatus);
            }
        });
        
        // Модальное окно изменения статуса
        const statusModal = document.getElementById('statusModal');
        if (statusModal) {
            statusModal.addEventListener('show.bs.modal', (e) => {
                const button = e.relatedTarget;
                const contractId = button.dataset.contractId;
                const currentStatus = button.dataset.currentStatus;
                
                document.getElementById('statusContractId').value = contractId;
                this.populateStatusOptions(currentStatus);
            });
        }
        
        // Сохранение статуса
        const saveStatusBtn = document.getElementById('saveStatusBtn');
        if (saveStatusBtn) {
            saveStatusBtn.addEventListener('click', () => {
                this.saveContractStatus();
            });
        }
    },
    
    initPaymentProcessing: function() {
        // Добавление платежа
        const addPaymentBtn = document.getElementById('addPaymentBtn');
        if (addPaymentBtn) {
            addPaymentBtn.addEventListener('click', () => {
                this.showAddPaymentModal();
            });
        }
        
        // Просмотр истории платежей
        document.addEventListener('click', (e) => {
            if (e.target.matches('.view-payments-btn')) {
                const contractId = e.target.dataset.contractId;
                this.showPaymentHistory(contractId);
            }
        });
    },
    
    initClaimsManagement: function() {
        // Добавление страхового случая
        const addClaimBtn = document.getElementById('addClaimBtn');
        if (addClaimBtn) {
            addClaimBtn.addEventListener('click', () => {
                this.showAddClaimModal();
            });
        }
        
        // Просмотр страховых случаев
        document.addEventListener('click', (e) => {
            if (e.target.matches('.view-claims-btn')) {
                const contractId = e.target.dataset.contractId;
                this.showClaimHistory(contractId);
            }
        });
    },
    
    initExportOptions: function() {
        // Экспорт договоров
        const exportBtn = document.getElementById('exportContracts');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportContracts();
            });
        }
        
        // Печать договора
        const printBtn = document.getElementById('printContract');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                this.printContract();
            });
        }
        
        // Скачивание PDF
        const pdfBtn = document.getElementById('downloadPdf');
        if (pdfBtn) {
            pdfBtn.addEventListener('click', () => {
                this.downloadPdf();
            });
        }
    },
    
    loadContracts: function() {
        const params = new URLSearchParams({
            page: this.currentPage,
            size: this.pageSize,
            sort: `${this.currentSort.field},${this.currentSort.direction}`,
            ...this.currentFilters
        });
        
        showLoading();
        
        fetch(`/api/contracts?${params}`)
            .then(response => response.json())
            .then(data => {
                this.renderContractsTable(data.content);
                this.renderPagination(data);
                this.renderStats(data.stats);
                hideLoading();
            })
            .catch(error => {
                console.error('Error loading contracts:', error);
                showNotification('error', 'Ошибка загрузки договоров');
                hideLoading();
            });
    },
    
    renderContractsTable: function(contracts) {
        const tbody = document.querySelector('#contractsTable tbody');
        if (!tbody) return;
        
        if (contracts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center py-5">
                        <i class="fas fa-file-contract fa-3x text-muted mb-3"></i>
                        <p class="text-muted">Договоры не найдены</p>
                        <a href="/contracts/new" class="btn btn-primary">
                            <i class="fas fa-plus"></i> Оформить первый договор
                        </a>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = contracts.map(contract => {
            const daysRemaining = this.calculateDaysRemaining(contract.endDate);
            const progressPercentage = this.calculateProgressPercentage(contract.startDate, contract.endDate);
            const statusBadge = this.getStatusBadge(contract.status.code);
            
            return `
                <tr data-contract-id="${contract.id}">
                    <td>
                        <input type="checkbox" class="form-check-input contract-checkbox" value="${contract.id}">
                    </td>
                    <td>
                        <a href="/contracts/${contract.id}" class="text-decoration-none fw-bold">
                            ${contract.contractNumber}
                        </a>
                    </td>
                    <td>
                        <a href="/clients/${contract.client.id}" class="text-decoration-none">
                            ${contract.client.fullName}
                        </a>
                        <br>
                        <small class="text-muted">${Formatter.formatPhone(contract.client.phone)}</small>
                    </td>
                    <td>
                        <span class="badge ${this.getTypeBadgeClass(contract.insuranceType.code)}">
                            ${contract.insuranceType.name}
                        </span>
                    </td>
                    <td>${statusBadge}</td>
                    <td>
                        ${Formatter.formatDate(contract.startDate)} - ${Formatter.formatDate(contract.endDate)}
                        <br>
                        <small class="text-muted">Осталось: ${daysRemaining} дней</small>
                        <div class="progress mt-1" style="height: 4px;">
                            <div class="progress-bar ${this.getProgressBarClass(progressPercentage)}" 
                                 style="width: ${progressPercentage}%">
                            </div>
                        </div>
                    </td>
                    <td class="text-end">
                        <span class="fw-bold">${Formatter.formatCurrency(contract.premiumAmount)}</span>
                        <br>
                        <small class="text-muted">${Formatter.formatCurrency(contract.insuredAmount)}</small>
                    </td>
                    <td>
                        ${contract.agent ? contract.agent.fullName : 'Не назначен'}
                    </td>
                    <td>${Formatter.formatDateTime(contract.createdAt)}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <a href="/contracts/${contract.id}" class="btn btn-info" title="Просмотр">
                                <i class="fas fa-eye"></i>
                            </a>
                            <a href="/contracts/${contract.id}/edit" class="btn btn-warning" title="Редактировать">
                                <i class="fas fa-edit"></i>
                            </a>
                            <button class="btn btn-success status-change-btn" 
                                    data-contract-id="${contract.id}"
                                    data-status="ACTIVE"
                                    title="Активировать"
                                    ${contract.status.code === 'ACTIVE' ? 'disabled' : ''}>
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-danger" 
                                    title="Удалить"
                                    onclick="ContractManager.deleteContract(${contract.id}, '${contract.contractNumber}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Инициализация тултипов
        this.initTooltips();
    },
    
    renderPagination: function(data) {
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;
        
        const totalPages = data.totalPages;
        const currentPage = data.number + 1;
        
        let html = `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <button class="page-link" onclick="ContractManager.goToPage(1)">
                    <i class="fas fa-angle-double-left"></i>
                </button>
            </li>
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <button class="page-link" onclick="ContractManager.goToPage(${currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </button>
            </li>
        `;
        
        // Показываем 5 страниц вокруг текущей
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);
        
        // Корректируем диапазон, если мы близко к началу или концу
        if (currentPage <= 3) {
            endPage = Math.min(5, totalPages);
        }
        if (currentPage >= totalPages - 2) {
            startPage = Math.max(1, totalPages - 4);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <button class="page-link" onclick="ContractManager.goToPage(${i})">${i}</button>
                </li>
            `;
        }
        
        html += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <button class="page-link" onclick="ContractManager.goToPage(${currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </li>
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <button class="page-link" onclick="ContractManager.goToPage(${totalPages})">
                    <i class="fas fa-angle-double-right"></i>
                </button>
            </li>
        `;
        
        pagination.innerHTML = html;
    },
    
    renderStats: function(stats) {
        if (!stats) return;
        
        // Обновляем счетчики в интерфейсе
        const elements = {
            totalContracts: document.querySelector('[data-stat="totalContracts"]'),
            activeContracts: document.querySelector('[data-stat="activeContracts"]'),
            expiringSoon: document.querySelector('[data-stat="expiringSoon"]'),
            totalPremium: document.querySelector('[data-stat="totalPremium"]')
        };
        
        if (elements.totalContracts) {
            elements.totalContracts.textContent = stats.totalContracts || 0;
        }
        if (elements.activeContracts) {
            elements.activeContracts.textContent = stats.activeContracts || 0;
        }
        if (elements.expiringSoon) {
            elements.expiringSoon.textContent = stats.expiringSoon || 0;
        }
        if (elements.totalPremium) {
            elements.totalPremium.textContent = Formatter.formatCurrency(stats.totalPremium || 0);
        }
    },
    
    goToPage: function(page) {
        this.currentPage = page;
        this.loadContracts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    sortContracts: function(field) {
        if (this.currentSort.field === field) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.field = field;
            this.currentSort.direction = 'asc';
        }
        
        this.loadContracts();
    },
    
    applyFilters: function(formData) {
        this.currentFilters = {};
        formData.forEach((value, key) => {
            if (value) {
                this.currentFilters[key] = value;
            }
        });
        
        this.currentPage = 1;
        this.loadContracts();
    },
    
    clearFilters: function() {
        this.currentFilters = {};
        this.currentPage = 1;
        
        // Очищаем форму фильтров
        const filterForm = document.getElementById('filterForm');
        if (filterForm) {
            filterForm.reset();
        }
        
        this.loadContracts();
    },
    
    calculatePremium: function() {
        const form = document.getElementById('contractForm');
        if (!form) return;
        
        const insuredAmountInput = form.querySelector('[name="insuredAmount"]');
        const premiumAmountInput = form.querySelector('[name="premiumAmount"]');
        const insuranceTypeSelect = form.querySelector('[name="insuranceTypeCode"]');
        
        if (!insuredAmountInput || !premiumAmountInput || !insuranceTypeSelect) return;
        
        const insuredAmount = parseFloat(insuredAmountInput.value) || 0;
        const insuranceType = insuranceTypeSelect.value;
        
        if (insuredAmount <= 0 || !insuranceType) return;
        
        // Коэффициенты для расчета премии
        const coefficients = {
            'CASCO': 0.03,      // 3%
            'OSAGO': 0.01,      // 1%
            'LIFE': 0.02,       // 2%
            'PROPERTY': 0.015   // 1.5%
        };
        
        const coefficient = coefficients[insuranceType] || 0.02;
        const calculatedPremium = insuredAmount * coefficient;
        
        premiumAmountInput.value = calculatedPremium.toFixed(2);
        
        // Показываем информацию о расчете
        const calculationInfo = document.getElementById('premiumCalculationInfo');
        if (calculationInfo) {
            calculationInfo.innerHTML = `
                <div class="alert alert-info mt-2">
                    <i class="fas fa-calculator"></i>
                    Премия рассчитана автоматически:
                    ${Formatter.formatCurrency(insuredAmount)} × ${(coefficient * 100).toFixed(1)}% = 
                    ${Formatter.formatCurrency(calculatedPremium)}
                </div>
            `;
        }
    },
    
    validateDates: function() {
        const form = document.getElementById('contractForm');
        if (!form) return;
        
        const startDateInput = form.querySelector('[name="startDate"]');
        const endDateInput = form.querySelector('[name="endDate"]');
        
        if (!startDateInput.value || !endDateInput.value) return;
        
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        
        if (endDate <= startDate) {
            showNotification('error', 'Дата окончания должна быть позже даты начала');
            endDateInput.classList.add('is-invalid');
        } else {
            endDateInput.classList.remove('is-invalid');
        }
    },
    
    showAdditionalFields: function(insuranceType) {
        const container = document.getElementById('additionalFields');
        if (!container) return;
        
        container.innerHTML = '';
        
        switch(insuranceType) {
            case 'CASCO':
                container.innerHTML = this.getCascoFields();
                break;
            case 'OSAGO':
                container.innerHTML = this.getOsagoFields();
                break;
            case 'LIFE':
                container.innerHTML = this.getLifeFields();
                break;
            case 'PROPERTY':
                container.innerHTML = this.getPropertyFields();
                break;
            default:
                container.innerHTML = '';
        }
    },
    
    getCascoFields: function() {
        return `
            <div class="row mt-4">
                <div class="col-12">
                    <h5><i class="fas fa-car"></i> Данные транспортного средства</h5>
                    <hr>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="vehicleModel" class="form-label">Модель ТС *</label>
                    <input type="text" class="form-control" id="vehicleModel" name="vehicleModel" required>
                </div>
                <div class="col-md-3 mb-3">
                    <label for="manufactureYear" class="form-label">Год выпуска *</label>
                    <input type="number" class="form-control" id="manufactureYear" name="manufactureYear" 
                           min="1900" max="${new Date().getFullYear()}" required>
                </div>
                <div class="col-md-3 mb-3">
                    <label for="vehicleCost" class="form-label">Стоимость ТС *</label>
                    <div class="input-group">
                        <input type="number" class="form-control" id="vehicleCost" name="vehicleCost" 
                               step="0.01" min="0" required>
                        <span class="input-group-text">₽</span>
                    </div>
                </div>
                <div class="col-md-6 mb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="hasFranchise" name="hasFranchise">
                        <label class="form-check-label" for="hasFranchise">
                            Применяется франшиза
                        </label>
                    </div>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="franchiseAmount" class="form-label">Сумма франшизы</label>
                    <div class="input-group">
                        <input type="number" class="form-control" id="franchiseAmount" name="franchiseAmount" 
                               step="0.01" min="0" disabled>
                        <span class="input-group-text">₽</span>
                    </div>
                </div>
            </div>
        `;
    },
    
    getOsagoFields: function() {
        return `
            <div class="row mt-4">
                <div class="col-12">
                    <h5><i class="fas fa-car-side"></i> Данные для ОСАГО</h5>
                    <hr>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="vehicleModel" class="form-label">Модель ТС *</label>
                    <input type="text" class="form-control" id="vehicleModel" name="vehicleModel" required>
                </div>
                <div class="col-md-3 mb-3">
                    <label for="licensePlate" class="form-label">Гос. номер</label>
                    <input type="text" class="form-control" id="licensePlate" name="licensePlate">
                </div>
                <div class="col-md-3 mb-3">
                    <label for="drivingExperience" class="form-label">Стаж вождения (лет) *</label>
                    <input type="number" class="form-control" id="drivingExperience" name="drivingExperience" 
                           min="0" required>
                </div>
            </div>
        `;
    },
    
    getLifeFields: function() {
        return `
            <div class="row mt-4">
                <div class="col-12">
                    <h5><i class="fas fa-heartbeat"></i> Данные застрахованного лица</h5>
                    <hr>
                </div>
                <div class="col-md-4 mb-3">
                    <label for="birthDate" class="form-label">Дата рождения *</label>
                    <input type="date" class="form-control" id="birthDate" name="birthDate" required>
                </div>
                <div class="col-md-4 mb-3">
                    <label for="gender" class="form-label">Пол *</label>
                    <select class="form-select" id="gender" name="gender" required>
                        <option value="">Выберите пол...</option>
                        <option value="M">Мужской</option>
                        <option value="F">Женский</option>
                    </select>
                </div>
                <div class="col-md-4 mb-3">
                    <label for="profession" class="form-label">Профессия</label>
                    <input type="text" class="form-control" id="profession" name="profession">
                </div>
                <div class="col-12 mb-3">
                    <label for="healthStatus" class="form-label">Состояние здоровья</label>
                    <textarea class="form-control" id="healthStatus" name="healthStatus" rows="3"></textarea>
                </div>
            </div>
        `;
    },
    
    getPropertyFields: function() {
        return `
            <div class="row mt-4">
                <div class="col-12">
                    <h5><i class="fas fa-home"></i> Данные объекта недвижимости</h5>
                    <hr>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="propertyType" class="form-label">Тип недвижимости *</label>
                    <input type="text" class="form-control" id="propertyType" name="propertyType" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="address" class="form-label">Адрес *</label>
                    <input type="text" class="form-control" id="address" name="address" required>
                </div>
                <div class="col-md-4 mb-3">
                    <label for="area" class="form-label">Площадь (м²) *</label>
                    <input type="number" class="form-control" id="area" name="area" step="0.01" min="0" required>
                </div>
                <div class="col-md-4 mb-3">
                    <label for="constructionYear" class="form-label">Год постройки *</label>
                    <input type="number" class="form-control" id="constructionYear" name="constructionYear" 
                           min="1800" max="${new Date().getFullYear()}" required>
                </div>
                <div class="col-md-4 mb-3">
                    <label for="propertyCost" class="form-label">Стоимость *</label>
                    <div class="input-group">
                        <input type="number" class="form-control" id="propertyCost" name="propertyCost" 
                               step="0.01" min="0" required>
                        <span class="input-group-text">₽</span>
                    </div>
                </div>
            </div>
        `;
    },
    
    checkContractNumberUniqueness: function(contractNumber) {
        if (!contractNumber || contractNumber.length < 3) return;
        
        fetch(`/api/contracts/check-number?number=${encodeURIComponent(contractNumber)}`)
            .then(response => response.json())
            .then(data => {
                if (data.exists) {
                    showNotification('warning', 'Договор с таким номером уже существует');
                }
            })
            .catch(error => console.error('Error checking contract number:', error));
    },
    
    changeContractStatus: function(contractId, newStatus) {
        if (!confirm('Изменить статус договора?')) return;
        
        fetch(`/api/contracts/${contractId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]')?.content
            },
            body: JSON.stringify({ status: newStatus })
        })
        .then(response => {
            if (response.ok) {
                showNotification('success', 'Статус договора изменен');
                this.loadContracts();
            } else {
                showNotification('error', 'Ошибка при изменении статуса');
            }
        })
        .catch(error => {
            console.error('Error changing status:', error);
            showNotification('error', 'Ошибка при изменении статуса');
        });
    },
    
    populateStatusOptions: function(currentStatus) {
        const statusSelect = document.getElementById('newStatus');
        if (!statusSelect) return;
        
        const statusOptions = {
            'DRAFT': 'Черновик',
            'ACTIVE': 'Активен',
            'EXPIRED': 'Истек',
            'TERMINATED': 'Расторгнут',
            'SUSPENDED': 'Приостановлен'
        };
        
        statusSelect.innerHTML = '';
        
        Object.entries(statusOptions).forEach(([code, name]) => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = name;
            if (code === currentStatus) {
                option.selected = true;
            }
            statusSelect.appendChild(option);
        });
    },
    
    saveContractStatus: function() {
        const contractId = document.getElementById('statusContractId').value;
        const newStatus = document.getElementById('newStatus').value;
        
        if (!contractId || !newStatus) return;
        
        this.changeContractStatus(contractId, newStatus);
        
        // Закрываем модальное окно
        const modal = bootstrap.Modal.getInstance(document.getElementById('statusModal'));
        modal.hide();
    },
    
    showAddPaymentModal: function() {
        // Реализация добавления платежа
        // ... (код для модального окна платежа)
    },
    
    showPaymentHistory: function(contractId) {
        // Реализация просмотра истории платежей
        // ... (код для просмотра платежей)
    },
    
    showAddClaimModal: function() {
        // Реализация добавления страхового случая
        // ... (код для модального окна страхового случая)
    },
    
    showClaimHistory: function(contractId) {
        // Реализация просмотра страховых случаев
        // ... (код для просмотра страховых случаев)
    },
    
    exportContracts: function() {
        const params = new URLSearchParams({
            ...this.currentFilters,
            sort: `${this.currentSort.field},${this.currentSort.direction}`
        });
        
        window.open(`/api/contracts/export?${params}`, '_blank');
    },
    
    printContract: function() {
        const contractId = this.getCurrentContractId();
        if (!contractId) return;
        
        window.open(`/contracts/${contractId}/print`, '_blank');
    },
    
    downloadPdf: function() {
        const contractId = this.getCurrentContractId();
        if (!contractId) return;
        
        window.open(`/contracts/${contractId}/pdf`, '_blank');
    },
    
    deleteContract: function(contractId, contractNumber) {
        if (!confirm(`Вы уверены, что хотите удалить договор "${contractNumber}"?`)) {
            return;
        }
        
        fetch(`/api/contracts/${contractId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]')?.content
            }
        })
        .then(response => {
            if (response.ok) {
                showNotification('success', `Договор "${contractNumber}" успешно удален`);
                this.loadContracts();
            } else {
                response.json().then(data => {
                    showNotification('error', data.message || 'Ошибка при удалении договора');
                });
            }
        })
        .catch(error => {
            console.error('Error deleting contract:', error);
            showNotification('error', 'Ошибка при удалении договора');
        });
    },
    
    // Вспомогательные методы
    calculateDaysRemaining: function(endDateString) {
        const endDate = new Date(endDateString);
        const today = new Date();
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    },
    
    calculateProgressPercentage: function(startDateString, endDateString) {
        const startDate = new Date(startDateString);
        const endDate = new Date(endDateString);
        const today = new Date();
        
        if (today < startDate) return 0;
        if (today > endDate) return 100;
        
        const totalDuration = endDate - startDate;
        const elapsedDuration = today - startDate;
        
        return Math.round((elapsedDuration / totalDuration) * 100);
    },
    
    getStatusBadge: function(statusCode) {
        const statuses = {
            'DRAFT': ['Черновик', 'secondary'],
            'ACTIVE': ['Активен', 'success'],
            'EXPIRED': ['Истек', 'warning'],
            'TERMINATED': ['Расторгнут', 'danger'],
            'SUSPENDED': ['Приостановлен', 'info']
        };
        
        const [text, color] = statuses[statusCode] || ['Неизвестно', 'secondary'];
        return `<span class="badge bg-${color}">${text}</span>`;
    },
    
    getTypeBadgeClass: function(typeCode) {
        const classes = {
            'CASCO': 'bg-info',
            'OSAGO': 'bg-primary',
            'LIFE': 'bg-success',
            'PROPERTY': 'bg-warning'
        };
        return classes[typeCode] || 'bg-secondary';
    },
    
    getProgressBarClass: function(percentage) {
        if (percentage >= 90) return 'bg-danger';
        if (percentage >= 75) return 'bg-warning';
        if (percentage >= 50) return 'bg-info';
        return 'bg-success';
    },
    
    getCurrentContractId: function() {
        const path = window.location.pathname;
        const match = path.match(/\/contracts\/(\d+)/);
        return match ? match[1] : null;
    },
    
    initTooltips: function() {
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
    }
};

// Вспомогательные функции
function showLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        loading.style.display = 'flex';
    }
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('#contractsTable') || document.querySelector('#contractForm')) {
        ContractManager.init();
    }
});