package com.kurs_project.insurance_system.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "osago_data")
@Data
public class OsagoData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "contract_id", unique = true)
    private Contract contract;
    
    @Column(name = "license_plate", length = 20)
    private String licensePlate;
    
    @Column(name = "vehicle_model", nullable = false, length = 100)
    private String vehicleModel;
    
    @Column(length = 50)
    private String vin;
    
    @Column(name = "driving_experience")
    private Integer drivingExperience;
}