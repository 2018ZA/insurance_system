package com.kurs_project.insurance_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "user_role", schema = "public")
@Data
public class UserRole {
    
    @Id
    @Column(name = "code", length = 50, nullable = false)
    private String code;
    
    @Column(name = "name", length = 100, nullable = false)
    private String name;
    
    // Связь с пользователями (если нужна обратная связь)
    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL)
    private List<User> users;
    
    // Конструкторы (Lombok создаст автоматически, но можно добавить свой)
    public UserRole() {
    }
    
    public UserRole(String code, String name) {
        this.code = code;
        this.name = name;
    }
}