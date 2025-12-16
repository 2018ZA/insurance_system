package com.kurs_project.insurance_system.entity;

import javax.persistence.*;

@Entity
@Table(name = "life_insurance_data")
public class LifeInsuranceData {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Integer age;
    private String healthStatus;
    private String occupation;
    
    @OneToOne
    @JoinColumn(name = "contract_id")
    private Contract contract;
    
    public LifeInsuranceData() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    
    public String getHealthStatus() { return healthStatus; }
    public void setHealthStatus(String healthStatus) { this.healthStatus = healthStatus; }
    
    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }
    
    public Contract getContract() { return contract; }
    public void setContract(Contract contract) { this.contract = contract; }
}