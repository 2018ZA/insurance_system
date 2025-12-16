package com.kurs_project.insurance_system.controller;

import com.kurs_project.insurance_system.entity.Client;
import com.kurs_project.insurance_system.service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/clients")
public class ClientController {
    
    @Autowired
    private ClientService clientService;
    
    @GetMapping
    public String listClients(Model model) {
        model.addAttribute("clients", clientService.getAllClients());
        return "client/list";
    }
    
    @GetMapping("/{id}")
    public String viewClient(@PathVariable Long id, Model model) {
        Client client = clientService.getClientById(id);
        model.addAttribute("client", client);
        return "client/view";
    }
    
    @GetMapping("/new")
    public String showClientForm(Model model) {
        model.addAttribute("client", new Client());
        return "client/form";
    }
    
    @PostMapping
    public String saveClient(@ModelAttribute Client client) {
        clientService.saveClient(client);
        return "redirect:/clients";
    }
}