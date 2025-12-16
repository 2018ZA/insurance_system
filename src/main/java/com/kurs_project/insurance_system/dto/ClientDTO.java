package com.kurs_project.insurance_system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import .Data;

@Data
public class ClientDTO {
    private Long id;
    
    @NotBlank(message = "ФИО обязательно")
    private String fullName;
    
    @Pattern(regexp = "\\d{4}", message = "Серия паспорта должна содержать 4 цифры")
    private String passportSeries;
    
    @Pattern(regexp = "\\d{6}", message = "Номер паспорта должен содержать 6 цифр")
    private String passportNumber;
    
    @NotBlank(message = "Телефон обязателен")
    @Pattern(regexp = "^\\+7\\d{10}$", message = "Телефон должен быть в формате +7XXXXXXXXXX")
    private String phone;
    
    @Email(message = "Некорректный email")
    private String email;
}