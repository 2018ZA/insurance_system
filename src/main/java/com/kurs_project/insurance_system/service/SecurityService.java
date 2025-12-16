package com.kurs_project.insurance_system.service;

import com.kurs_project.insurance_system.entity.User;
import com.kurs_project.insurance_system.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import .RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SecurityService {
    
    private final UserRepository userRepository;
    private final HttpSession session;
    
    public Optional<User> getCurrentUser() {
        Long userId = (Long) session.getAttribute("userId");
        if (userId != null) {
            return userRepository.findById(userId);
        }
        return Optional.empty();
    }
    
    public boolean isAuthenticated() {
        return session.getAttribute("userId") != null;
    }
    
    public void login(User user) {
        session.setAttribute("userId", user.getId());
        session.setAttribute("userRole", user.getRole().getCode());
        session.setAttribute("userName", user.getFullName());
    }
    
    public void logout() {
        session.invalidate();
    }
    
    public boolean hasRole(String roleCode) {
        String userRole = (String) session.getAttribute("userRole");
        return roleCode.equals(userRole);
    }
    
    public boolean hasAnyRole(String... roleCodes) {
        String userRole = (String) session.getAttribute("userRole");
        for (String role : roleCodes) {
            if (role.equals(userRole)) {
                return true;
            }
        }
        return false;
    }
    
    public boolean isAdmin() {
        return hasRole("ADMIN");
    }
    
    public boolean isManager() {
        return hasAnyRole("MANAGER", "ADMIN");
    }
    
    public boolean isAgent() {
        return hasAnyRole("AGENT", "MANAGER", "ADMIN");
    }
}