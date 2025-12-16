package com.kurs_project.insurance_system.controller;

import com.kurs_project.insurance_system.dto.AuthRequest;
import com.kurs_project.insurance_system.dto.AuthResponse;
import com.kurs_project.insurance_system.entity.User;
import com.kurs_project.insurance_system.service.UserService;
import com.kurs_project.insurance_system.util.SecurityUtils;
import jakarta.validation.Valid;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequiredArgsConstructor
public class AuthController {
    
    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    
    @GetMapping("/login")
    public String loginPage(Model model) {
        if (SecurityUtils.isAuthenticated()) {
            return "redirect:/";
        }
        model.addAttribute("authRequest", new AuthRequest());
        return "auth/login";
    }
    
    @PostMapping("/login")
    @ResponseBody
    public AuthResponse login(@Valid @ModelAttribute AuthRequest authRequest, 
                             BindingResult result) {
        if (result.hasErrors()) {
            return AuthResponse.error("Неверные данные для входа");
        }
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    authRequest.getUsername(),
                    authRequest.getPassword()
                )
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Получаем пользователя и сохраняем в сессии
            User user = userService.getUserByLogin(authRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
            
            SecurityUtils.setCurrentUser(user);
            
            return AuthResponse.success("/");
            
        } catch (Exception e) {
            return AuthResponse.error("Неверный логин или пароль");
        }
    }
    
    @PostMapping("/logout")
    public String logout(RedirectAttributes redirectAttributes) {
        SecurityUtils.clearCurrentUser();
        SecurityContextHolder.clearContext();
        redirectAttributes.addFlashAttribute("message", "Вы успешно вышли из системы");
        return "redirect:/login";
    }
    
    @GetMapping("/access-denied")
    public String accessDenied() {
        return "error/403";
    }
}