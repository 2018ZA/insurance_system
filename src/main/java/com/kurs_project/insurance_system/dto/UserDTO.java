package com.kurs_project.insurance_system.dto;

import jakarta.validation.constraints.NotBlank;
import .Data;

@Data
public class UserDTO {
    private Long id;
    
    @NotBlank(message = "Логин обязателен")
    private String login;
    
    private String password;
    
    @NotBlank(message = "ФИО обязательно")
    private String fullName;
    
    @NotBlank(message = "Роль обязательна")
    private String roleCode;
    
    private Boolean active = true;
}