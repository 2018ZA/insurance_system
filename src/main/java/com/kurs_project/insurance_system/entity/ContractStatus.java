package com.kurs_project.insurance_system.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "contract_status")
@Data
public class ContractStatus {
    @Id
    @Column(length = 50)
    private String code;
    
    @Column(nullable = false, length = 100)
    private String name;
}