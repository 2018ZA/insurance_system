package com.kurs_project.insurance_system.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StatisticRepository {
    
    @Query(value = "SELECT EXTRACT(MONTH FROM c.created_at) as month, " +
                   "EXTRACT(YEAR FROM c.created_at) as year, " +
                   "COUNT(*) as count " +
                   "FROM contract c " +
                   "WHERE c.created_at >= :startDate " +
                   "GROUP BY EXTRACT(YEAR FROM c.created_at), EXTRACT(MONTH FROM c.created_at) " +
                   "ORDER BY year, month", 
           nativeQuery = true)
    List<Object[]> getMonthlyContractStatistics(@Param("startDate") LocalDate startDate);
    
    @Query(value = "SELECT it.name, COUNT(c.id) as count " +
                   "FROM contract c " +
                   "JOIN insurance_type it ON c.insurance_type_code = it.code " +
                   "GROUP BY it.name", 
           nativeQuery = true)
    List<Object[]> getContractsByType();
    
    @Query(value = "SELECT cs.name, COUNT(c.id) as count " +
                   "FROM contract c " +
                   "JOIN contract_status cs ON c.status_code = cs.code " +
                   "GROUP BY cs.name", 
           nativeQuery = true)
    List<Object[]> getContractsByStatus();
    
    @Query(value = "SELECT TO_CHAR(c.created_at, 'YYYY-MM') as month, " +
                   "SUM(c.premium_amount) as total_premium " +
                   "FROM contract c " +
                   "WHERE c.created_at >= :startDate " +
                   "GROUP BY TO_CHAR(c.created_at, 'YYYY-MM') " +
                   "ORDER BY month", 
           nativeQuery = true)
    List<Object[]> getPremiumByMonth(@Param("startDate") LocalDate startDate);
}