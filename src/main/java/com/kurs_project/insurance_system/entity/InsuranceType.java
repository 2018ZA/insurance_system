package com.kurs_project.insurance_system.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "insurance_type")
@Data
public class InsuranceType {
    @Id
    @Column(length = 50)
    private String code;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(length = 100)
    private String category;
    
    private Boolean active = true;
}