package com.kurs_project.insurance_system.entity;

import jakarta.persistence.*;
import .Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "client")
@Data
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;
    
    @Column(name = "passport_series", length = 10)
    private String passportSeries;
    
    @Column(name = "passport_number", length = 20)
    private String passportNumber;
    
    @Column(nullable = false, unique = true, length = 20)
    private String phone;
    
    @Column(length = 100)
    private String email;
    
    @Column(name = "registration_date")
    private LocalDateTime registrationDate = LocalDateTime.now();
    
    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL)
    private List<Contract> contracts;
    
    @PrePersist
    public void prePersist() {
        if (registrationDate == null) {
            registrationDate = LocalDateTime.now();
        }
    }
}