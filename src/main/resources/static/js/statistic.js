// Файл для управления статистикой и графиками

const StatisticManager = {
    charts: {},
    currentPeriod: 'month',
    
    init: function() {
        this.initDateRange();
        this.initCharts();
        this.initFilters();
        this.initExport();
        this.loadStatistics();
        
        // Автоматическое обновление статистики каждые 5 минут
        setInterval(() => this.loadStatistics(), 5 * 60 * 1000);
    },
    
    initDateRange: function() {
        // Установка дат по умолчанию
        const today = new Date();
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput && !startDateInput.value) {
            startDateInput.value = monthAgo.toISOString().split('T')[0];
        }
        
        if (endDateInput && !endDateInput.value) {
            endDateInput.value = today.toISOString().split('T')[0];
        }
        
        // Инициализация datepicker
        if (typeof flatpickr !== 'undefined') {
            flatpickr('#startDate, #endDate', {
                dateFormat: 'd.m.Y',
                locale: 'ru'
            });
        }
    },
    
    initCharts: function() {
        this.charts = {
            contractsByType: this.createContractsByTypeChart(),
            premiumByMonth: this.createPremiumByMonthChart(),
            contractsByStatus: this.createContractsByStatusChart(),
            paymentTrend: this.createPaymentTrendChart(),
            clientGrowth: this.createClientGrowthChart(),
            claimsByType: this.createClaimsByTypeChart()
        };
    },
    
    initFilters: function() {
        const filterForm = document.getElementById('statFilterForm');
        if (!filterForm) return;
        
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.loadStatistics();
        });
        
        // Быстрые периоды
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.setPeriod(e.target.dataset.period);
            });
        });
        
        // Фильтр по типу страхования
        const typeFilter = document.getElementById('insuranceTypeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', () => {
                this.loadStatistics();
            });
        }
        
        // Фильтр по агенту
        const agentFilter = document.getElementById('agentFilter');
        if (agentFilter) {
            agentFilter.addEventListener('change', () => {
                this.loadStatistics();
            });
        }
    },
    
    initExport: function() {
        const exportBtn = document.getElementById('exportStats');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportStatistics();
            });
        }
        
        const printBtn = document.getElementById('printStats');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                this.printStatistics();
            });
        }
    },
    
    loadStatistics: function() {
        showLoading();
        
        const params = this.getFilterParams();
        
        Promise.all([
            this.loadSummaryStats(),
            this.loadChartData(params),
            this.loadTableData(params)
        ]).then(() => {
            hideLoading();
        }).catch(error => {
            console.error('Error loading statistics:', error);
            showNotification('error', 'Ошибка загрузки статистики');
            hideLoading();
        });
    },
    
    loadSummaryStats: function() {
        return fetch('/api/statistics/summary')
            .then(response => response.json())
            .then(data => {
                this.updateSummaryStats(data);
            });
    },
    
    loadChartData: function(params) {
        return fetch(`/api/statistics/charts?${params}`)
            .then(response => response.json())
            .then(data => {
                this.updateCharts(data);
            });
    },
    
    loadTableData: function(params) {
        return fetch(`/api/statistics/tables?${params}`)
            .then(response => response.json())
            .then(data => {
                this.updateTables(data);
            });
    },
    
    getFilterParams: function() {
        const params = new URLSearchParams();
        
        // Даты
        const startDate = document.getElementById('startDate')?.value;
        const endDate = document.getElementById('endDate')?.value;
        
        if (startDate) {
            params.append('startDate', startDate);
        }
        
        if (endDate) {
            params.append('endDate', endDate);
        }
        
        // Фильтры
        const insuranceType = document.getElementById('insuranceTypeFilter')?.value;
        if (insuranceType) {
            params.append('insuranceType', insuranceType);
        }
        
        const agentId = document.getElementById('agentFilter')?.value;
        if (agentId) {
            params.append('agentId', agentId);
        }
        
        return params;
    },
    
    setPeriod: function(period) {
        const today = new Date();
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        let startDate = new Date();
        
        switch(period) {
            case 'week':
                startDate.setDate(today.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(today.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(today.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(today.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(today.getMonth() - 1);
        }
        
        startDateInput.value = startDate.toISOString().split('T')[0];
        endDateInput.value = today.toISOString().split('T')[0];
        
        this.loadStatistics();
        
        // Обновляем активную кнопку периода
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`).classList.add('active');
    },
    
    updateSummaryStats: function(data) {
        // Обновляем основные показатели
        const stats = {
            totalClients: document.querySelector('[data-stat="totalClients"]'),
            totalContracts: document.querySelector('[data-stat="totalContracts"]'),
            activeContracts: document.querySelector('[data-stat="activeContracts"]'),
            totalPremium: document.querySelector('[data-stat="totalPremium"]'),
            monthlyPremium: document.querySelector('[data-stat="monthlyPremium"]'),
            claimsCount: document.querySelector('[data-stat="claimsCount"]'),
            paymentsAmount: document.querySelector('[data-stat="paymentsAmount"]'),
            averageContractValue: document.querySelector('[data-stat="averageContractValue"]')
        };
        
        Object.entries(stats).forEach(([key, element]) => {
            if (element && data[key] !== undefined) {
                if (key.includes('Premium') || key.includes('Amount') || key.includes('Value')) {
                    element.textContent = Formatter.formatCurrency(data[key]);
                } else {
                    element.textContent = data[key].toLocaleString('ru-RU');
                }
            }
        });
        
        // Обновляем изменение показателей
        const changes = {
            clientGrowth: document.querySelector('[data-change="clientGrowth"]'),
            contractGrowth: document.querySelector('[data-change="contractGrowth"]'),
            premiumGrowth: document.querySelector('[data-change="premiumGrowth"]')
        };
        
        Object.entries(changes).forEach(([key, element]) => {
            if (element && data[key] !== undefined) {
                const change = data[key];
                element.textContent = `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
                element.className = `stat-change ${change > 0 ? 'positive' : 'negative'}`;
            }
        });
    },
    
    updateCharts: function(data) {
        // Обновляем каждый график
        if (this.charts.contractsByType && data.contractsByType) {
            this.updateContractsByTypeChart(data.contractsByType);
        }
        
        if (this.charts.premiumByMonth && data.premiumByMonth) {
            this.updatePremiumByMonthChart(data.premiumByMonth);
        }
        
        if (this.charts.contractsByStatus && data.contractsByStatus) {
            this.updateContractsByStatusChart(data.contractsByStatus);
        }
        
        if (this.charts.paymentTrend && data.paymentTrend) {
            this.updatePaymentTrendChart(data.paymentTrend);
        }
        
        if (this.charts.clientGrowth && data.clientGrowth) {
            this.updateClientGrowthChart(data.clientGrowth);
        }
        
        if (this.charts.claimsByType && data.claimsByType) {
            this.updateClaimsByTypeChart(data.claimsByType);
        }
    },
    
    updateTables: function(data) {
        // Обновляем таблицы
        if (data.recentContracts) {
            this.updateRecentContractsTable(data.recentContracts);
        }
        
        if (data.topAgents) {
            this.updateTopAgentsTable(data.topAgents);
        }
        
        if (data.expiringContracts) {
            this.updateExpiringContractsTable(data.expiringContracts);
        }
        
        if (data.claimStatistics) {
            this.updateClaimStatisticsTable(data.claimStatistics);
        }
    },
    
    createContractsByTypeChart: function() {
        const canvas = document.getElementById('contractsByTypeChart');
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#3498db', // CASCO
                        '#2ecc71', // OSAGO
                        '#e74c3c', // LIFE
                        '#f39c12', // PROPERTY
                        '#9b59b6'  // Другие
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: 'Распределение договоров по типам страхования'
                    }
                }
            }
        });
    },
    
    updateContractsByTypeChart: function(data) {
        if (!this.charts.contractsByType) return;
        
        this.charts.contractsByType.data.labels = data.map(item => item.type);
        this.charts.contractsByType.data.datasets[0].data = data.map(item => item.count);
        this.charts.contractsByType.update();
    },
    
    createPremiumByMonthChart: function() {
        const canvas = document.getElementById('premiumByMonthChart');
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Страховые премии',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Динамика страховых премий по месяцам'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return Formatter.formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    },
    
    updatePremiumByMonthChart: function(data) {
        if (!this.charts.premiumByMonth) return;
        
        this.charts.premiumByMonth.data.labels = data.map(item => item.month);
        this.charts.premiumByMonth.data.datasets[0].data = data.map(item => item.amount);
        this.charts.premiumByMonth.update();
    },
    
    createContractsByStatusChart: function() {
        const canvas = document.getElementById('contractsByStatusChart');
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Количество договоров',
                    data: [],
                    backgroundColor: [
                        '#95a5a6', // Черновик
                        '#2ecc71', // Активен
                        '#f39c12', // Истек
                        '#e74c3c'  // Расторгнут
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Договоры по статусам'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    },
    
    updateContractsByStatusChart: function(data) {
        if (!this.charts.contractsByStatus) return;
        
        this.charts.contractsByStatus.data.labels = data.map(item => item.status);
        this.charts.contractsByStatus.data.datasets[0].data = data.map(item => item.count);
        this.charts.contractsByStatus.update();
    },
    
    createPaymentTrendChart: function() {
        const canvas = document.getElementById('paymentTrendChart');
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Ожидаемые платежи',
                        data: [],
                        borderColor: '#f39c12',
                        backgroundColor: 'rgba(243, 156, 18, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5]
                    },
                    {
                        label: 'Полученные платежи',
                        data: [],
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        borderWidth: 2,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Тренд платежей'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return Formatter.formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    },
    
    updatePaymentTrendChart: function(data) {
        if (!this.charts.paymentTrend) return;
        
        this.charts.paymentTrend.data.labels = data.map(item => item.date);
        this.charts.paymentTrend.data.datasets[0].data = data.map(item => item.expected);
        this.charts.paymentTrend.data.datasets[1].data = data.map(item => item.received);
        this.charts.paymentTrend.update();
    },
    
    createClientGrowthChart: function() {
        const canvas = document.getElementById('clientGrowthChart');
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Новые клиенты',
                    data: [],
                    borderColor: '#9b59b6',
                    backgroundColor: 'rgba(155, 89, 182, 0.1)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Рост клиентской базы'
                    }
                }
            }
        });
    },
    
    updateClientGrowthChart: function(data) {
        if (!this.charts.clientGrowth) return;
        
        this.charts.clientGrowth.data.labels = data.map(item => item.month);
        this.charts.clientGrowth.data.datasets[0].data = data.map(item => item.count);
        this.charts.clientGrowth.update();
    },
    
    createClaimsByTypeChart: function() {
        const canvas = document.getElementById('claimsByTypeChart');
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        return new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#e74c3c',
                        '#3498db',
                        '#2ecc71',
                        '#f39c12',
                        '#9b59b6'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Страховые случаи по типам договоров'
                    }
                }
            }
        });
    },
    
    updateClaimsByTypeChart: function(data) {
        if (!this.charts.claimsByType) return;
        
        this.charts.claimsByType.data.labels = data.map(item => item.type);
        this.charts.claimsByType.data.datasets[0].data = data.map(item => item.count);
        this.charts.claimsByType.update();
    },
    
    updateRecentContractsTable: function(contracts) {
        const tbody = document.querySelector('#recentContractsTable tbody');
        if (!tbody) return;
        
        tbody.innerHTML = contracts.map(contract => `
            <tr>
                <td>
                    <a href="/contracts/${contract.id}" class="text-decoration-none">
                        ${contract.contractNumber}
                    </a>
                </td>
                <td>${contract.clientName}</td>
                <td>
                    <span class="badge ${this.getTypeBadgeClass(contract.insuranceType)}">
                        ${contract.insuranceType}
                    </span>
                </td>
                <td>${Formatter.formatCurrency(contract.premiumAmount)}</td>
                <td>${Formatter.formatDate(contract.createdAt)}</td>
            </tr>
        `).join('');
    },
    
    updateTopAgentsTable: function(agents) {
        const tbody = document.querySelector('#topAgentsTable tbody');
        if (!tbody) return;
        
        tbody.innerHTML = agents.map((agent, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${agent.fullName}</td>
                <td>${agent.contractCount}</td>
                <td>${Formatter.formatCurrency(agent.totalPremium)}</td>
                <td>${Formatter.formatCurrency(agent.averagePremium)}</td>
            </tr>
        `).join('');
    },
    
    updateExpiringContractsTable: function(contracts) {
        const tbody = document.querySelector('#expiringContractsTable tbody');
        if (!tbody) return;
        
        tbody.innerHTML = contracts.map(contract => {
            const daysLeft = this.calculateDaysRemaining(contract.endDate);
            const urgencyClass = daysLeft <= 7 ? 'text-danger' : daysLeft <= 30 ? 'text-warning' : '';
            
            return `
                <tr>
                    <td>
                        <a href="/contracts/${contract.id}" class="text-decoration-none">
                            ${contract.contractNumber}
                        </a>
                    </td>
                    <td>${contract.clientName}</td>
                    <td>${contract.insuranceType}</td>
                    <td>${Formatter.formatDate(contract.endDate)}</td>
                    <td class="${urgencyClass}">
                        ${daysLeft} дней
                    </td>
                    <td>
                        <a href="/clients/${contract.clientId}" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-phone"></i> Напоминание
                        </a>
                    </td>
                </tr>
            `;
        }).join('');
    },
    
    updateClaimStatisticsTable: function(stats) {
        const tbody = document.querySelector('#claimStatisticsTable tbody');
        if (!tbody) return;
        
        tbody.innerHTML = stats.map(stat => `
            <tr>
                <td>${stat.insuranceType}</td>
                <td>${stat.totalContracts}</td>
                <td>${stat.claimsCount}</td>
                <td>${(stat.claimsCount / stat.totalContracts * 100).toFixed(2)}%</td>
                <td>${Formatter.formatCurrency(stat.totalClaimAmount)}</td>
                <td>${Formatter.formatCurrency(stat.averageClaimAmount)}</td>
            </tr>
        `).join('');
    },
    
    exportStatistics: function() {
        const params = this.getFilterParams();
        window.open(`/api/statistics/export?${params}`, '_blank');
    },
    
    printStatistics: function() {
        window.print();
    },
    
    // Вспомогательные методы
    calculateDaysRemaining: function(endDateString) {
        const endDate = new Date(endDateString);
        const today = new Date();
        const diffTime = endDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    
    getTypeBadgeClass: function(type) {
        const classes = {
            'CASCO': 'bg-info',
            'OSAGO': 'bg-primary',
            'LIFE': 'bg-success',
            'PROPERTY': 'bg-warning'
        };
        return classes[type] || 'bg-secondary';
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.statistics-page')) {
        StatisticManager.init();
    }
});