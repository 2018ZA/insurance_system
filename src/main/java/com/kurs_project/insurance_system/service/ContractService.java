package com.kurs_project.insurance_system.service;

import com.kurs_project.insurance_system.entity.Contract;
import com.kurs_project.insurance_system.repository.ContractRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ContractService {
    
    @Autowired
    private ContractRepository contractRepository;
    
    public List<Contract> getAllContracts() {
        return contractRepository.findAll();
    }
    
    public Contract getContractById(Long id) {
        return contractRepository.findById(id).orElse(null);
    }
    
    public Contract saveContract(Contract contract) {
        return contractRepository.save(contract);
    }
    
    public void deleteContract(Long id) {
        contractRepository.deleteById(id);
    }
}