package com.kurs_project.insurance_system.entity;

import jakarta.persistence.*;
import .Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "insurance_claim")
@Data
public class InsuranceClaim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "contract_id")
    private Contract contract;
    
    @Column(name = "claim_number", unique = true, nullable = false, length = 100)
    private String claimNumber;
    
    @Column(name = "incident_date", nullable = false)
    private LocalDate incidentDate;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "claimed_amount", precision = 15, scale = 2)
    private BigDecimal claimedAmount;
    
    @Column(name = "approved_amount", precision = 15, scale = 2)
    private BigDecimal approvedAmount;
    
    @ManyToOne
    @JoinColumn(name = "status_code", referencedColumnName = "code")
    private ClaimStatus status;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (claimNumber == null) {
            claimNumber = "CLM-" + System.currentTimeMillis();
        }
    }
}