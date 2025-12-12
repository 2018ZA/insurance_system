package com.kurs_project.insurance_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "casco_data")
@Data
public class CascoData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "contract_id", unique = true)
    private Contract contract;
    
    @Column(name = "vehicle_model", nullable = false, length = 100)
    private String vehicleModel;
    
    @Column(name = "manufacture_year")
    private Integer manufactureYear;
    
    @Column(name = "vehicle_cost", nullable = false, precision = 15, scale = 2)
    private BigDecimal vehicleCost;
    
    @Column(name = "has_franchise")
    private Boolean hasFranchise = false;
    
    @Column(name = "franchise_amount", precision = 15, scale = 2)
    private BigDecimal franchiseAmount = BigDecimal.ZERO;
}