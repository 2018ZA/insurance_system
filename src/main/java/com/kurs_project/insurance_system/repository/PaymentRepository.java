package com.kurs_project.insurance_system.repository;

import com.kurs_project.insurance_system.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    Page<Payment> findByContractId(Long contractId, Pageable pageable);
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.contract.id = :contractId AND p.status.code = 'PAID'")
    BigDecimal getTotalPaidByContract(@Param("contractId") Long contractId);
    
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.paymentDate BETWEEN :startDate AND :endDate")
    long countByPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentDate BETWEEN :startDate AND :endDate AND p.status.code = 'PAID'")
    BigDecimal getTotalAmountByPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}