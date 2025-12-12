package com.kurs_project.insurance_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 100)
    private String login;
    
    @Column(nullable = false, length = 255)
    private String password;
    
    @ManyToOne
    @JoinColumn(name = "role_code", referencedColumnName = "code")
    private UserRole role;
    
    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;
    
    private Boolean active = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}