package com.kurs_project.insurance_system.entity;

import jakarta.persistence.*;
import .Data;
import java.math.BigDecimal;

@Entity
@Table(name = "property_insurance_data")
@Data
public class PropertyInsuranceData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "contract_id", unique = true)
    private Contract contract;
    
    @Column(name = "property_type", nullable = false, length = 100)
    private String propertyType;
    
    @Column(nullable = false, length = 200)
    private String address;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal area;
    
    @Column(name = "construction_year")
    private Integer constructionYear;
    
    @Column(name = "cost", nullable = false, precision = 15, scale = 2)
    private BigDecimal cost;
}