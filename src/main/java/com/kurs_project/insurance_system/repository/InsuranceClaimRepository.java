package com.kurs_project.insurance_system.repository;

import com.kurs_project.insurance_system.entity.InsuranceClaim;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface InsuranceClaimRepository extends JpaRepository<InsuranceClaim, Long> {
    
    Page<InsuranceClaim> findByContractId(Long contractId, Pageable pageable);
    
    @Query("SELECT COUNT(c) FROM InsuranceClaim c WHERE c.incidentDate BETWEEN :startDate AND :endDate")
    long countByPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(c.approvedAmount) FROM InsuranceClaim c WHERE c.incidentDate BETWEEN :startDate AND :endDate AND c.status.code = 'APPROVED'")
    Double getTotalApprovedAmountByPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}