package com.kurs_project.insurance_system.entity;

import jakarta.persistence.*;
import .Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payment")
@Data
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "contract_id")
    private Contract contract;
    
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "payment_date")
    private LocalDate paymentDate = LocalDate.now();
    
    @ManyToOne
    @JoinColumn(name = "status_code", referencedColumnName = "code")
    private PaymentStatus status;
    
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;
    
    @Column(name = "transaction_number", length = 100)
    private String transactionNumber;
}