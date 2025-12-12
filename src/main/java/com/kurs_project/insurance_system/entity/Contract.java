package com.kurs_project.insurance_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "contract")
@Data
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "contract_number", unique = true, nullable = false, length = 100)
    private String contractNumber;
    
    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;
    
    @ManyToOne
    @JoinColumn(name = "insurance_type_code", referencedColumnName = "code")
    private InsuranceType insuranceType;
    
    @ManyToOne
    @JoinColumn(name = "agent_id")
    private User agent;
    
    @ManyToOne
    @JoinColumn(name = "status_code", referencedColumnName = "code")
    private ContractStatus status;
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    
    @Column(name = "premium_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal premiumAmount;
    
    @Column(name = "insured_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal insuredAmount;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @OneToOne(mappedBy = "contract", cascade = CascadeType.ALL)
    private OsagoData osagoData;
    
    @OneToOne(mappedBy = "contract", cascade = CascadeType.ALL)
    private CascoData cascoData;
    
    @OneToOne(mappedBy = "contract", cascade = CascadeType.ALL)
    private LifeInsuranceData lifeInsuranceData;
    
    @OneToOne(mappedBy = "contract", cascade = CascadeType.ALL)
    private PropertyInsuranceData propertyInsuranceData;
    
    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (contractNumber == null) {
            contractNumber = "CTR-" + System.currentTimeMillis();
        }
    }
}