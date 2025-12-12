package com.kurs_project.insurance_system.repository;

import com.kurs_project.insurance_system.entity.Contract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    
    Page<Contract> findAll(Pageable pageable);
    
    @Query("SELECT c FROM Contract c WHERE c.contractNumber LIKE CONCAT('%', :number, '%')")
    Page<Contract> findByContractNumberContaining(@Param("number") String number, Pageable pageable);
    
    @Query("SELECT c FROM Contract c WHERE c.insuranceType.code = :typeCode")
    Page<Contract> findByInsuranceType(@Param("typeCode") String typeCode, Pageable pageable);
    
    @Query("SELECT c FROM Contract c WHERE c.status.code = :statusCode")
    Page<Contract> findByStatus(@Param("statusCode") String statusCode, Pageable pageable);
    
    @Query("SELECT c FROM Contract c WHERE c.startDate BETWEEN :startDate AND :endDate")
    Page<Contract> findByPeriod(@Param("startDate") LocalDate startDate, 
                               @Param("endDate") LocalDate endDate, 
                               Pageable pageable);
    
    @Query("SELECT COUNT(c) FROM Contract c")
    long countAll();
    
    @Query("SELECT COUNT(c) FROM Contract c WHERE c.insuranceType.code = :typeCode")
    long countByInsuranceType(@Param("typeCode") String typeCode);
    
    @Query("SELECT AVG(c.premiumAmount) FROM Contract c WHERE c.insuranceType.code = :typeCode")
    Double findAveragePremiumByType(@Param("typeCode") String typeCode);
    
    @Query("SELECT COUNT(c), FUNCTION('MONTH', c.createdAt), FUNCTION('YEAR', c.createdAt) " +
           "FROM Contract c " +
           "WHERE c.createdAt >= :startDate " +
           "GROUP BY FUNCTION('YEAR', c.createdAt), FUNCTION('MONTH', c.createdAt) " +
           "ORDER BY FUNCTION('YEAR', c.createdAt), FUNCTION('MONTH', c.createdAt)")
    List<Object[]> getMonthlyStatistics(@Param("startDate") LocalDate startDate);
}