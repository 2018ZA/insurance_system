package com.kurs_project.insurance_system.repository;

import com.kurs_project.insurance_system.entity.InsuranceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface insuranceTypeRepository extends JpaRepository<InsuranceType, String> {
}