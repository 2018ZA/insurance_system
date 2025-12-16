package com.kurs_project.insurance_system.entity;

import jakarta.persistence.*;
import .Data;
import java.time.LocalDate;

@Entity
@Table(name = "life_insurance_data")
@Data
public class LifeInsuranceData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "contract_id", unique = true)
    private Contract contract;
    
    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;
    
    @Column(length = 10)
    private String gender;
    
    @Column(length = 100)
    private String profession;
    
    @Column(name = "health_status", length = 200)
    private String healthStatus;
}