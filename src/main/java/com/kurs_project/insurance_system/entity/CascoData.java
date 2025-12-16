package com.kurs_project.insurance_system.entity;

import javax.persistence.*;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "casco_data")
public class CascoData {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String carModel;
    private Integer carYear;
    private String licensePlate;
    private Double carValue;
    
    @OneToOne
    @JoinColumn(name = "contract_id")
    private Contract contract;
    
    public CascoData() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCarModel() { return carModel; }
    public void setCarModel(String carModel) { this.carModel = carModel; }
    
    public Integer getCarYear() { return carYear; }
    public void setCarYear(Integer carYear) { this.carYear = carYear; }
    
    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }
    
    public Double getCarValue() { return carValue; }
    public void setCarValue(Double carValue) { this.carValue = carValue; }
    
    public Contract getContract() { return contract; }
    public void setContract(Contract contract) { this.contract = contract; }
}