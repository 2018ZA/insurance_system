package com.kurs_project.insurance_system.util;

import com.kurs_project.insurance_system.entity.User;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class SecurityUtils {
    
    public static Long getCurrentUserId() {
        ServletRequestAttributes attr = (ServletRequestAttributes) 
            RequestContextHolder.currentRequestAttributes();
        HttpSession session = attr.getRequest().getSession();
        return (Long) session.getAttribute("userId");
    }
    
    public static String getCurrentUserRole() {
        ServletRequestAttributes attr = (ServletRequestAttributes) 
            RequestContextHolder.currentRequestAttributes();
        HttpSession session = attr.getRequest().getSession();
        return (String) session.getAttribute("userRole");
    }
    
    public static String getCurrentUserName() {
        ServletRequestAttributes attr = (ServletRequestAttributes) 
            RequestContextHolder.currentRequestAttributes();
        HttpSession session = attr.getRequest().getSession();
        return (String) session.getAttribute("userName");
    }
    
    public static boolean isAuthenticated() {
        return getCurrentUserId() != null;
    }
    
    public static boolean hasRole(String role) {
        String userRole = getCurrentUserRole();
        return userRole != null && userRole.equals(role);
    }
    
    public static boolean hasAnyRole(String... roles) {
        String userRole = getCurrentUserRole();
        if (userRole == null) return false;
        
        for (String role : roles) {
            if (role.equals(userRole)) {
                return true;
            }
        }
        return false;
    }
    
    public static void setCurrentUser(User user) {
        ServletRequestAttributes attr = (ServletRequestAttributes) 
            RequestContextHolder.currentRequestAttributes();
        HttpSession session = attr.getRequest().getSession();
        
        session.setAttribute("userId", user.getId());
        session.setAttribute("userRole", user.getRole().getCode());
        session.setAttribute("userName", user.getFullName());
    }
    
    public static void clearCurrentUser() {
        ServletRequestAttributes attr = (ServletRequestAttributes) 
            RequestContextHolder.currentRequestAttributes();
        HttpSession session = attr.getRequest().getSession();
        
        session.removeAttribute("userId");
        session.removeAttribute("userRole");
        session.removeAttribute("userName");
    }
}