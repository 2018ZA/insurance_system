package com.kurs_project.insurance_system.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/about")
public class AboutController {
    
    @GetMapping
    public String aboutPage(Model model) {
        model.addAttribute("title", "About Insurance System");
        return "about/index";
    }
}