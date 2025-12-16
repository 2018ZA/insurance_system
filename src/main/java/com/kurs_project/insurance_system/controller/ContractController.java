package com.kurs_project.insurance_system.controller;

import com.kurs_project.insurance_system.entity.Contract;
import com.kurs_project.insurance_system.service.ContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/contracts")
public class ContractController {
    
    @Autowired
    private ContractService contractService;
    
    @GetMapping
    public String listContracts(Model model) {
        model.addAttribute("contracts", contractService.getAllContracts());
        return "contract/list";
    }
    
    @GetMapping("/{id}")
    public String viewContract(@PathVariable Long id, Model model) {
        Contract contract = contractService.getContractById(id);
        model.addAttribute("contract", contract);
        return "contract/view";
    }
    
    @GetMapping("/new")
    public String showContractForm(Model model) {
        model.addAttribute("contract", new Contract());
        return "contract/form";
    }
    
    @PostMapping
    public String saveContract(@ModelAttribute Contract contract) {
        contractService.saveContract(contract);
        return "redirect:/contracts";
    }
}