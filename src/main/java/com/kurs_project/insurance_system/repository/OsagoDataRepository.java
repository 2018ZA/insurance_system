package com.kurs_project.insurance_system.repository;

import com.kurs_project.insurance_system.entity.OsagoData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OsagoDataRepository extends JpaRepository<OsagoData, Long> {
    OsagoData findByContractId(Long contractId);
}