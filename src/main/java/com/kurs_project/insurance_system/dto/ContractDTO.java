package com.kurs_project.insurance_system.dto;

import java.time.LocalDate;

public class ContractDTO {
    private Long id;
    private String contractNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double amount;
    private Long clientId;
    private Long insuranceTypeId;
    
    public ContractDTO() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getContractNumber() { return contractNumber; }
    public void setContractNumber(String contractNumber) { this.contractNumber = contractNumber; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    
    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }
    
    public Long getInsuranceTypeId() { return insuranceTypeId; }
    public void setInsuranceTypeId(Long insuranceTypeId) { this.insuranceTypeId = insuranceTypeId; }
}