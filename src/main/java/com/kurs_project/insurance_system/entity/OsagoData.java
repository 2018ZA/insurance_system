package com.kurs_project.insurance_system.entity;

import javax.persistence.*;

@Entity
@Table(name = "osago_data")
public class OsagoData {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String driverLicense;
    private Integer drivingExperience;
    private String carModel;
    private String licensePlate;
    
    @OneToOne
    @JoinColumn(name = "contract_id")
    private Contract contract;
    
    public OsagoData() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getDriverLicense() { return driverLicense; }
    public void setDriverLicense(String driverLicense) { this.driverLicense = driverLicense; }
    
    public Integer getDrivingExperience() { return drivingExperience; }
    public void setDrivingExperience(Integer drivingExperience) { this.drivingExperience = drivingExperience; }
    
    public String getCarModel() { return carModel; }
    public void setCarModel(String carModel) { this.carModel = carModel; }
    
    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }
    
    public Contract getContract() { return contract; }
    public void setContract(Contract contract) { this.contract = contract; }
}