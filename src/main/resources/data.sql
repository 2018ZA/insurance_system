-- Вставка справочных данных
INSERT INTO user_role (code, name) VALUES 
('ADMIN', 'Администратор'),
('AGENT', 'Страховой агент'),
('MANAGER', 'Менеджер')
ON CONFLICT (code) DO NOTHING;

INSERT INTO insurance_type (code, name, category) VALUES 
('OSAGO', 'ОСАГО', 'Авто'),
('CASCO', 'КАСКО', 'Авто'),
('LIFE', 'Страхование жизни', 'Жизнь'),
('PROPERTY', 'Страхование недвижимости', 'Недвижимость')
ON CONFLICT (code) DO NOTHING;

INSERT INTO contract_status (code, name) VALUES 
('DRAFT', 'Черновик'),
('ACTIVE', 'Активен'),
('EXPIRED', 'Истек'),
('TERMINATED', 'Расторгнут')
ON CONFLICT (code) DO NOTHING;

INSERT INTO payment_status (code, name) VALUES 
('PENDING', 'Ожидает оплаты'),
('PAID', 'Оплачен'),
('FAILED', 'Неуспешный'),
('REFUNDED', 'Возвращен')
ON CONFLICT (code) DO NOTHING;

INSERT INTO claim_status (code, name) VALUES 
('NEW', 'Новый'),
('IN_REVIEW', 'На рассмотрении'),
('APPROVED', 'Одобрен'),
('REJECTED', 'Отклонен')
ON CONFLICT (code) DO NOTHING;

-- Создание тестового администратора (пароль: admin123)
INSERT INTO users (login, password, role_code, full_name, active) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVpUiG', 'ADMIN', 'Иванов Иван Иванович', true),
('agent1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVpUiG', 'AGENT', 'Петров Петр Петрович', true),
('manager1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVpUiG', 'MANAGER', 'Сидорова Мария Сергеевна', true)
ON CONFLICT (login) DO NOTHING;

-- Тестовые клиенты
INSERT INTO client (full_name, passport_series, passport_number, phone, email) VALUES 
('Смирнов Алексей Владимирович', '4501', '123456', '+79161234567', 'smirnov@mail.ru'),
('Кузнецова Ольга Дмитриевна', '4502', '654321', '+79167654321', 'kuznetsova@gmail.com'),
('Васильев Дмитрий Сергеевич', '4503', '789012', '+79169012345', 'vasilyev@yandex.ru'),
('Николаева Анна Петровна', '4504', '345678', '+79163456789', 'nikolaeva@mail.ru')
ON CONFLICT (phone) DO NOTHING;