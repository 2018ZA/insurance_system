package com.kurs_project.insurance_system.repository;

import com.kurs_project.insurance_system.entity.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    
    Page<Client> findAll(Pageable pageable);
    
    @Query("SELECT c FROM Client c WHERE LOWER(c.fullName) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Client> findByFullNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);
    
    @Query("SELECT c FROM Client c WHERE c.passportSeries = :series AND c.passportNumber = :number")
    Client findByPassportData(@Param("series") String series, @Param("number") String number);
    
    boolean existsByPassportSeriesAndPassportNumber(String series, String number);
    
    boolean existsByPhone(String phone);
    
    @Query("SELECT COUNT(c) FROM Client c")
    long countAll();
}