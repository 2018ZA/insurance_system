package com.kurs_project.insurance_system.entity;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "insurance_claim")
public class InsuranceClaim {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String claimNumber;
    private LocalDate claimDate;
    private String description;
    private Double claimedAmount;
    
    @ManyToOne
    @JoinColumn(name = "contract_id")
    private Contract contract;
    
    @ManyToOne
    @JoinColumn(name = "claim_status_id")
    private ClaimStatus claimStatus;
    
    public InsuranceClaim() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getClaimNumber() { return claimNumber; }
    public void setClaimNumber(String claimNumber) { this.claimNumber = claimNumber; }
    
    public LocalDate getClaimDate() { return claimDate; }
    public void setClaimDate(LocalDate claimDate) { this.claimDate = claimDate; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Double getClaimedAmount() { return claimedAmount; }
    public void setClaimedAmount(Double claimedAmount) { this.claimedAmount = claimedAmount; }
    
    public Contract getContract() { return contract; }
    public void setContract(Contract contract) { this.contract = contract; }
    
    public ClaimStatus getClaimStatus() { return claimStatus; }
    public void setClaimStatus(ClaimStatus claimStatus) { this.claimStatus = claimStatus; }
}