package com.kurs_project.insurance_system.controller;

import com.kurs_project.insurance_system.service.ClientService;
import com.kurs_project.insurance_system.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Map;

@Controller
@RequestMapping("/statistics")
@RequiredArgsConstructor
public class StatisticController {
    
    private final ClientService clientService;
    private final ContractService contractService;
    
    @GetMapping
    public String showStatistics(Model model) {
        long clientCount = clientService.getClientCount();
        long contractCount = contractService.getContractCount();
        Map<String, Object> contractStats = contractService.getContractStatistics();
        
        model.addAttribute("clientCount", clientCount);
        model.addAttribute("contractCount", contractCount);
        model.addAttribute("contractStats", contractStats);
        
        return "statistic/dashboard";
    }
}