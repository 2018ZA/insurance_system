package com.kurs_project.insurance_system.controller;

import com.kurs_project.insurance_system.dto.StatisticDTO;
import com.kurs_project.insurance_system.service.StatisticService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/statistics")
public class StatisticController {
    
    @Autowired
    private StatisticService statisticService;
    
    @GetMapping
    public String showStatistics(Model model) {
        StatisticDTO statistics = statisticService.getStatistics();
        model.addAttribute("statistics", statistics);
        return "statistic/dashboard";
    }
}