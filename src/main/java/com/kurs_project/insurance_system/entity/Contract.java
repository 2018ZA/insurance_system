package com.kurs_project.insurance_system.entity;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "contract")
public class Contract {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String contractNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double amount;
    
    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;
    
    @ManyToOne
    @JoinColumn(name = "insurance_type_id")
    private InsuranceType insuranceType;
    
    @ManyToOne
    @JoinColumn(name = "contract_status_id")
    private ContractStatus contractStatus;
    
    public Contract() {}
    
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
    
    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
    
    public InsuranceType getInsuranceType() { return insuranceType; }
    public void setInsuranceType(InsuranceType insuranceType) { this.insuranceType = insuranceType; }
    
    public ContractStatus getContractStatus() { return contractStatus; }
    public void setContractStatus(ContractStatus contractStatus) { this.contractStatus = contractStatus; }
}