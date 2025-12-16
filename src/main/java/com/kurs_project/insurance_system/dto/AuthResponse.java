package com.kurs_project.insurance_system.dto;

import .Data;

@Data
public class AuthResponse {
    private boolean success;
    private String message;
    private String token;
    private String redirectUrl;
    
    public static AuthResponse success(String redirectUrl) {
        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Успешная авторизация");
        response.setRedirectUrl(redirectUrl);
        return response;
    }
    
    public static AuthResponse error(String message) {
        AuthResponse response = new AuthResponse();
        response.setSuccess(false);
        response.setMessage(message);
        return response;
    }
}