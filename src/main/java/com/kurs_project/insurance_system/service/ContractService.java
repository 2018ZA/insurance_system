package com.kurs_project.insurance_system.service;

import com.kurs_project.insurance_system.dto.ContractDTO;
import com.kurs_project.insurance_system.entity.*;
import com.kurs_project.insurance_system.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ContractService {
    
    private final ContractRepository contractRepository;
    private final ClientRepository clientRepository;
    private final InsuranceTypeRepository insuranceTypeRepository;
    private final ContractStatusRepository contractStatusRepository;
    private final UserRepository userRepository;
    private final CascoDataRepository cascoDataRepository;
    private final OsagoDataRepository osagoDataRepository;
    private final LifeInsuranceDataRepository lifeInsuranceDataRepository;
    private final PropertyInsuranceDataRepository propertyInsuranceDataRepository;
    
    public Page<Contract> getAllContracts(Pageable pageable) {
        return contractRepository.findAll(pageable);
    }
    
    public Page<Contract> searchContracts(String contractNumber, String typeCode, 
                                         String statusCode, LocalDate startDate, 
                                         LocalDate endDate, Pageable pageable) {
        if (contractNumber != null && !contractNumber.isEmpty()) {
            return contractRepository.findByContractNumberContaining(contractNumber, pageable);
        } else if (typeCode != null && !typeCode.isEmpty()) {
            return contractRepository.findByInsuranceType(typeCode, pageable);
        } else if (statusCode != null && !statusCode.isEmpty()) {
            return contractRepository.findByStatus(statusCode, pageable);
        } else if (startDate != null && endDate != null) {
            return contractRepository.findByPeriod(startDate, endDate, pageable);
        }
        return contractRepository.findAll(pageable);
    }
    
    public Contract getContractById(Long id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Договор не найден"));
    }
    
    @Transactional
    public Contract createContract(ContractDTO contractDTO, Long agentId) {
        // Валидация дат
        if (contractDTO.getEndDate().isBefore(contractDTO.getStartDate())) {
            throw new RuntimeException("Дата окончания должна быть позже даты начала");
        }
        
        Client client = clientRepository.findById(contractDTO.getClientId())
                .orElseThrow(() -> new RuntimeException("Клиент не найден"));
        
        InsuranceType insuranceType = insuranceTypeRepository.findById(contractDTO.getInsuranceTypeCode())
                .orElseThrow(() -> new RuntimeException("Тип страхования не найден"));
        
        ContractStatus status = contractStatusRepository.findById("DRAFT")
                .orElseGet(() -> {
                    ContractStatus newStatus = new ContractStatus();
                    newStatus.setCode("DRAFT");
                    newStatus.setName("Черновик");
                    return contractStatusRepository.save(newStatus);
                });
        
        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Агент не найден"));
        
        Contract contract = new Contract();
        contract.setClient(client);
        contract.setInsuranceType(insuranceType);
        contract.setAgent(agent);
        contract.setStatus(status);
        contract.setStartDate(contractDTO.getStartDate());
        contract.setEndDate(contractDTO.getEndDate());
        contract.setPremiumAmount(contractDTO.getPremiumAmount());
        contract.setInsuredAmount(contractDTO.getInsuredAmount());
        contract.setContractNumber(generateContractNumber(insuranceType));
        
        Contract savedContract = contractRepository.save(contract);
        
        // Создание специфичных данных в зависимости от типа страхования
        createSpecificData(savedContract, contractDTO);
        
        return savedContract;
    }
    
    private void createSpecificData(Contract contract, ContractDTO dto) {
        switch (contract.getInsuranceType().getCode()) {
            case "CASCO":
                CascoData cascoData = new CascoData();
                cascoData.setContract(contract);
                cascoData.setVehicleModel(dto.getVehicleModel());
                cascoData.setManufactureYear(dto.getManufactureYear());
                cascoData.setVehicleCost(dto.getVehicleCost());
                cascoData.setHasFranchise(dto.getHasFranchise());
                cascoData.setFranchiseAmount(dto.getFranchiseAmount() != null ? 
                    dto.getFranchiseAmount() : BigDecimal.ZERO);
                cascoDataRepository.save(cascoData);
                break;
                
            case "OSAGO":
                OsagoData osagoData = new OsagoData();
                osagoData.setContract(contract);
                osagoData.setVehicleModel(dto.getVehicleModel());
                osagoDataRepository.save(osagoData);
                break;
                
            case "LIFE":
                LifeInsuranceData lifeData = new LifeInsuranceData();
                lifeData.setContract(contract);
                lifeData.setBirthDate(dto.getBirthDate());
                lifeData.setGender(dto.getGender());
                lifeData.setProfession(dto.getProfession());
                lifeData.setHealthStatus(dto.getHealthStatus());
                lifeInsuranceDataRepository.save(lifeData);
                break;
                
            case "PROPERTY":
                PropertyInsuranceData propertyData = new PropertyInsuranceData();
                propertyData.setContract(contract);
                propertyData.setPropertyType(dto.getPropertyType());
                propertyData.setAddress(dto.getAddress());
                propertyData.setArea(dto.getArea());
                propertyData.setConstructionYear(dto.getConstructionYear());
                propertyData.setCost(dto.getPropertyCost());
                propertyInsuranceDataRepository.save(propertyData);
                break;
        }
    }
    
    private String generateContractNumber(InsuranceType type) {
        String prefix = type.getCode();
        long count = contractRepository.countAll() + 1;
        return String.format("%s-%04d-%d", prefix, count, System.currentTimeMillis() % 1000);
    }
    
    @Transactional
    public Contract updateContract(Long id, ContractDTO contractDTO) {
        Contract contract = getContractById(id);
        
        // Валидация дат
        if (contractDTO.getEndDate().isBefore(contractDTO.getStartDate())) {
            throw new RuntimeException("Дата окончания должна быть позже даты начала");
        }
        
        contract.setStartDate(contractDTO.getStartDate());
        contract.setEndDate(contractDTO.getEndDate());
        contract.setPremiumAmount(contractDTO.getPremiumAmount());
        contract.setInsuredAmount(contractDTO.getInsuredAmount());
        
        return contractRepository.save(contract);
    }
    
    @Transactional
    public void updateContractStatus(Long id, String statusCode) {
        Contract contract = getContractById(id);
        ContractStatus status = contractStatusRepository.findById(statusCode)
                .orElseThrow(() -> new RuntimeException("Статус не найден"));
        contract.setStatus(status);
        contractRepository.save(contract);
    }
    
    @Transactional
    public void deleteContract(Long id) {
        Contract contract = getContractById(id);
        
        // Можно удалять только договоры в статусе "Черновик"
        if (!"DRAFT".equals(contract.getStatus().getCode())) {
            throw new RuntimeException("Можно удалять только договоры в статусе 'Черновик'");
        }
        
        contractRepository.delete(contract);
    }
    
    public long getContractCount() {
        return contractRepository.countAll();
    }
    
    public Map<String, Object> getContractStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        
        statistics.put("totalContracts", contractRepository.countAll());
        
        // Количество по типам
        Map<String, Long> byType = new HashMap<>();
        byType.put("CASCO", contractRepository.countByInsuranceType("CASCO"));
        byType.put("OSAGO", contractRepository.countByInsuranceType("OSAGO"));
        byType.put("LIFE", contractRepository.countByInsuranceType("LIFE"));
        byType.put("PROPERTY", contractRepository.countByInsuranceType("PROPERTY"));
        statistics.put("contractsByType", byType);
        
        // Средние премии
        Map<String, Double> avgPremiums = new HashMap<>();
        avgPremiums.put("CASCO", contractRepository.findAveragePremiumByType("CASCO"));
        avgPremiums.put("OSAGO", contractRepository.findAveragePremiumByType("OSAGO"));
        avgPremiums.put("LIFE", contractRepository.findAveragePremiumByType("LIFE"));
        avgPremiums.put("PROPERTY", contractRepository.findAveragePremiumByType("PROPERTY"));
        statistics.put("averagePremiums", avgPremiums);
        
        // Динамика по месяцам
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
        statistics.put("monthlyTrend", contractRepository.getMonthlyStatistics(sixMonthsAgo));
        
        return statistics;
    }
}