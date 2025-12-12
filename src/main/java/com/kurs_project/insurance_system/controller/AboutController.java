package com.kurs_project.insurance_system.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.time.LocalDate;

@Controller
@RequestMapping("/about")
public class AboutController {
    
    @GetMapping
    public String showAboutPage(Model model) {
        model.addAttribute("author", "Владислав Иванов");
        model.addAttribute("group", "ДПИ23-1");
        model.addAttribute("institution", "Финансовый университет при правительстве РФ");
        model.addAttribute("email", "vladislav.ivanov@example.com");
        model.addAttribute("phone", "+7 (999) 7777777");
        model.addAttribute("projectStart", LocalDate.of(2025, 10, 1));
        model.addAttribute("projectEnd", LocalDate.of(2025, 12, 30));
        model.addAttribute("technologies", new String[]{
            "Spring Boot MVC",
            "Hibernate/JPA",
            "JavaScript/TypeScript",
            "PostgreSQL",
            "REST API",
            "Thymeleaf",
            "Spring Security"
        });
        
        return "about/index";
    }
}