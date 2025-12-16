package com.kurs_project.insurance_system.controller;

import com.kurs_project.insurance_system.dto.ContractDTO;
import com.kurs_project.insurance_system.entity.Client;
import com.kurs_project.insurance_system.entity.Contract;
import com.kurs_project.insurance_system.entity.InsuranceType;
import com.kurs_project.insurance_system.service.ClientService;
import com.kurs_project.insurance_system.service.ContractService;
import com.kurs_project.insurance_system.repository.InsuranceTypeRepository;
import jakarta.validation.Valid;
import .RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;
import java.util.List;

@Controller
@RequestMapping("/contracts")
@RequiredArgsConstructor
public class ContractController {
    
    private final ContractService contractService;
    private final ClientService clientService;
    private final InsuranceTypeRepository insuranceTypeRepository;
    
    @GetMapping
    public String listContracts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String contractNumber,
            @RequestParam(required = false) String typeCode,
            @RequestParam(required = false) String statusCode,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Model model) {
        
        Sort sort = direction.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Contract> contractsPage = contractService.searchContracts(
            contractNumber, typeCode, statusCode, startDate, endDate, pageable);
        
        List<InsuranceType> insuranceTypes = insuranceTypeRepository.findAll();
        
        model.addAttribute("contracts", contractsPage.getContent());
        model.addAttribute("currentPage", contractsPage.getNumber());
        model.addAttribute("totalPages", contractsPage.getTotalPages());
        model.addAttribute("totalItems", contractsPage.getTotalElements());
        model.addAttribute("sortBy", sortBy);
        model.addAttribute("direction", direction);
        model.addAttribute("insuranceTypes", insuranceTypes);
        model.addAttribute("contractNumber", contractNumber);
        model.addAttribute("typeCode", typeCode);
        model.addAttribute("statusCode", statusCode);
        model.addAttribute("startDate", startDate);
        model.addAttribute("endDate", endDate);
        
        return "contract/list";
    }
    
    @GetMapping("/new")
    public String showCreateForm(Model model) {
        List<Client> clients = clientService.getAllClients(PageRequest.of(0, 1000)).getContent();
        List<InsuranceType> insuranceTypes = insuranceTypeRepository.findAll();
        
        model.addAttribute("contractDTO", new ContractDTO());
        model.addAttribute("clients", clients);
        model.addAttribute("insuranceTypes", insuranceTypes);
        model.addAttribute("today", LocalDate.now());
        model.addAttribute("nextYear", LocalDate.now().plusYears(1));
        
        return "contract/form";
    }
    
    @PostMapping
    public String createContract(@Valid @ModelAttribute ContractDTO contractDTO,
                                BindingResult result,
                                @RequestAttribute Long currentUserId,
                                RedirectAttributes redirectAttributes,
                                Model model) {
        if (result.hasErrors()) {
            List<Client> clients = clientService.getAllClients(PageRequest.of(0, 1000)).getContent();
            List<InsuranceType> insuranceTypes = insuranceTypeRepository.findAll();
            
            model.addAttribute("clients", clients);
            model.addAttribute("insuranceTypes", insuranceTypes);
            model.addAttribute("today", LocalDate.now());
            model.addAttribute("nextYear", LocalDate.now().plusYears(1));
            
            return "contract/form";
        }
        
        try {
            contractService.createContract(contractDTO, currentUserId);
            redirectAttributes.addFlashAttribute("success", "Договор успешно создан");
            return "redirect:/contracts";
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/contracts/new";
        }
    }
    
    @GetMapping("/{id}/edit")
    public String showEditForm(@PathVariable Long id, Model model) {
        Contract contract = contractService.getContractById(id);
        List<InsuranceType> insuranceTypes = insuranceTypeRepository.findAll();
        
        ContractDTO contractDTO = new ContractDTO();
        contractDTO.setId(contract.getId());
        contractDTO.setClientId(contract.getClient().getId());
        contractDTO.setInsuranceTypeCode(contract.getInsuranceType().getCode());
        contractDTO.setStartDate(contract.getStartDate());
        contractDTO.setEndDate(contract.getEndDate());
        contractDTO.setPremiumAmount(contract.getPremiumAmount());
        contractDTO.setInsuredAmount(contract.getInsuredAmount());
        
        // Заполнение специфичных данных
        fillSpecificData(contract, contractDTO);
        
        model.addAttribute("contractDTO", contractDTO);
        model.addAttribute("insuranceTypes", insuranceTypes);
        model.addAttribute("today", LocalDate.now());
        
        return "contract/form";
    }
    
    private void fillSpecificData(Contract contract, ContractDTO dto) {
        switch (contract.getInsuranceType().getCode()) {
            case "CASCO":
                if (contract.getCascoData() != null) {
                    dto.setVehicleModel(contract.getCascoData().getVehicleModel());
                    dto.setManufactureYear(contract.getCascoData().getManufactureYear());
                    dto.setVehicleCost(contract.getCascoData().getVehicleCost());
                    dto.setHasFranchise(contract.getCascoData().getHasFranchise());
                    dto.setFranchiseAmount(contract.getCascoData().getFranchiseAmount());
                }
                break;
            case "LIFE":
                if (contract.getLifeInsuranceData() != null) {
                    dto.setBirthDate(contract.getLifeInsuranceData().getBirthDate());
                    dto.setGender(contract.getLifeInsuranceData().getGender());
                    dto.setProfession(contract.getLifeInsuranceData().getProfession());
                    dto.setHealthStatus(contract.getLifeInsuranceData().getHealthStatus());
                }
                break;
            case "PROPERTY":
                if (contract.getPropertyInsuranceData() != null) {
                    dto.setPropertyType(contract.getPropertyInsuranceData().getPropertyType());
                    dto.setAddress(contract.getPropertyInsuranceData().getAddress());
                    dto.setArea(contract.getPropertyInsuranceData().getArea());
                    dto.setConstructionYear(contract.getPropertyInsuranceData().getConstructionYear());
                    dto.setPropertyCost(contract.getPropertyInsuranceData().getCost());
                }
                break;
        }
    }
    
    @PostMapping("/{id}")
    public String updateContract(@PathVariable Long id,
                                @Valid @ModelAttribute ContractDTO contractDTO,
                                BindingResult result,
                                RedirectAttributes redirectAttributes,
                                Model model) {
        if (result.hasErrors()) {
            List<InsuranceType> insuranceTypes = insuranceTypeRepository.findAll();
            model.addAttribute("insuranceTypes", insuranceTypes);
            model.addAttribute("today", LocalDate.now());
            return "contract/form";
        }
        
        try {
            contractService.updateContract(id, contractDTO);
            redirectAttributes.addFlashAttribute("success", "Договор успешно обновлен");
            return "redirect:/contracts";
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/contracts/" + id + "/edit";
        }
    }
    
    @PostMapping("/{id}/status")
    public String updateStatus(@PathVariable Long id,
                              @RequestParam String statusCode,
                              RedirectAttributes redirectAttributes) {
        try {
            contractService.updateContractStatus(id, statusCode);
            redirectAttributes.addFlashAttribute("success", "Статус договора обновлен");
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/contracts/" + id;
    }
    
    @PostMapping("/{id}/delete")
    public String deleteContract(@PathVariable Long id,
                                RedirectAttributes redirectAttributes) {
        try {
            contractService.deleteContract(id);
            redirectAttributes.addFlashAttribute("success", "Договор успешно удален");
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/contracts";
    }
    
    @GetMapping("/{id}")
    public String viewContract(@PathVariable Long id, Model model) {
        Contract contract = contractService.getContractById(id);
        model.addAttribute("contract", contract);
        return "contract/view";
    }
}