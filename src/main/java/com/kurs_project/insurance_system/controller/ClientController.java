package com.kurs_project.insurance_system.controller;

import com.kurs_project.insurance_system.dto.ClientDTO;
import com.kurs_project.insurance_system.entity.Client;
import com.kurs_project.insurance_system.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/clients")
@RequiredArgsConstructor
public class ClientController {
    
    private final ClientService clientService;
    
    @GetMapping
    public String listClients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fullName") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String search,
            Model model) {
        
        Sort sort = direction.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Client> clientsPage;
        if (search != null && !search.trim().isEmpty()) {
            clientsPage = clientService.searchClients(search, pageable);
            model.addAttribute("search", search);
        } else {
            clientsPage = clientService.getAllClients(pageable);
        }
        
        model.addAttribute("clients", clientsPage.getContent());
        model.addAttribute("currentPage", clientsPage.getNumber());
        model.addAttribute("totalPages", clientsPage.getTotalPages());
        model.addAttribute("totalItems", clientsPage.getTotalElements());
        model.addAttribute("sortBy", sortBy);
        model.addAttribute("direction", direction);
        
        return "client/list";
    }
    
    @GetMapping("/new")
    public String showCreateForm(Model model) {
        model.addAttribute("clientDTO", new ClientDTO());
        return "client/form";
    }
    
    @PostMapping
    public String createClient(@Valid @ModelAttribute ClientDTO clientDTO,
                              BindingResult result,
                              RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "client/form";
        }
        
        try {
            clientService.createClient(clientDTO);
            redirectAttributes.addFlashAttribute("success", "Клиент успешно создан");
            return "redirect:/clients";
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/clients/new";
        }
    }
    
    @GetMapping("/{id}/edit")
    public String showEditForm(@PathVariable Long id, Model model) {
        Client client = clientService.getClientById(id);
        ClientDTO clientDTO = new ClientDTO();
        clientDTO.setId(client.getId());
        clientDTO.setFullName(client.getFullName());
        clientDTO.setPassportSeries(client.getPassportSeries());
        clientDTO.setPassportNumber(client.getPassportNumber());
        clientDTO.setPhone(client.getPhone());
        clientDTO.setEmail(client.getEmail());
        
        model.addAttribute("clientDTO", clientDTO);
        return "client/form";
    }
    
    @PostMapping("/{id}")
    public String updateClient(@PathVariable Long id,
                              @Valid @ModelAttribute ClientDTO clientDTO,
                              BindingResult result,
                              RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "client/form";
        }
        
        try {
            clientService.updateClient(id, clientDTO);
            redirectAttributes.addFlashAttribute("success", "Клиент успешно обновлен");
            return "redirect:/clients";
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/clients/" + id + "/edit";
        }
    }
    
    @PostMapping("/{id}/delete")
    public String deleteClient(@PathVariable Long id,
                              RedirectAttributes redirectAttributes) {
        try {
            clientService.deleteClient(id);
            redirectAttributes.addFlashAttribute("success", "Клиент успешно удален");
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/clients";
    }
    
    @GetMapping("/{id}")
    public String viewClient(@PathVariable Long id, Model model) {
        Client client = clientService.getClientById(id);
        model.addAttribute("client", client);
        return "client/view";
    }
}