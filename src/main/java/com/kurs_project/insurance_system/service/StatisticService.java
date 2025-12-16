package com.kurs_project.insurance_system.service;

import com.kurs_project.insurance_system.dto.StatisticDTO;
import com.kurs_project.insurance_system.repository.ContractRepository;
import com.kurs_project.insurance_system.repository.InsuranceClaimRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StatisticService {
    
    @Autowired
    private ContractRepository contractRepository;
    
    @Autowired
    private InsuranceClaimRepository insuranceClaimRepository;
    
    public StatisticDTO getStatistics() {
        StatisticDTO dto = new StatisticDTO();
        dto.setTotalContracts(contractRepository.countAllContracts());
        dto.setActiveContracts(contractRepository.countActiveContracts());
        dto.setTotalRevenue(contractRepository.sumTotalRevenue());
        dto.setTotalClaims(insuranceClaimRepository.countAllClaims());
        return dto;
    }
}