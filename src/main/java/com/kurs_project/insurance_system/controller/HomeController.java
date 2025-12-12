package com.kurs_project.insurance_system.controller;

import com.kurs_project.insurance_system.service.ClientService;
import com.kurs_project.insurance_system.service.ContractService;
import com.kurs_project.insurance_system.service.StatisticService;
import com.kurs_project.insurance_system.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class HomeController {
    
    private final ClientService clientService;
    private final ContractService contractService;
    private final StatisticService statisticService;
    
    @GetMapping("/")
    public String home(Model model) {
        if (!SecurityUtils.isAuthenticated()) {
            return "redirect:/login";
        }
        
        // Основная статистика для дашборда
        model.addAttribute("clientCount", clientService.getClientCount());
        model.addAttribute("contractCount", contractService.getContractCount());
        
        // Быстрые ссылки в зависимости от роли
        String userRole = SecurityUtils.getCurrentUserRole();
        model.addAttribute("userRole", userRole);
        model.addAttribute("userName", SecurityUtils.getCurrentUserName());
        
        // Недавние договоры (последние 5)
        // TODO: Добавить метод для получения последних договоров
        
        return "home/index";
    }
    
    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        if (!SecurityUtils.isAuthenticated()) {
            return "redirect:/login";
        }
        
        model.addAttribute("statistics", statisticService.getDashboardStatistics());
        return "statistic/dashboard";
    }
}