package com.kurs_project.insurance_system.dto;

import jakarta.validation.constraints.NotBlank;
import .Data;

@Data
public class AuthRequest {
    @NotBlank(message = "Логин обязателен")
    private String username;
    
    @NotBlank(message = "Пароль обязателен")
    private String password;
}