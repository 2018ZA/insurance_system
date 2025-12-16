package com.kurs_project.insurance_system.entity;

import javax.persistence.*;

@Entity
@Table(name = "property_insurance_data")
public class PropertyInsuranceData {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String propertyType;
    private String address;
    private Double propertyValue;
    private Integer constructionYear;
    
    @OneToOne
    @JoinColumn(name = "contract_id")
    private Contract contract;
    
    public PropertyInsuranceData() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getPropertyType() { return propertyType; }
    public void setPropertyType(String propertyType) { this.propertyType = propertyType; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public Double getPropertyValue() { return propertyValue; }
    public void setPropertyValue(Double propertyValue) { this.propertyValue = propertyValue; }
    
    public Integer getConstructionYear() { return constructionYear; }
    public void setConstructionYear(Integer constructionYear) { this.constructionYear = constructionYear; }
    
    public Contract getContract() { return contract; }
    public void setContract(Contract contract) { this.contract = contract; }
}