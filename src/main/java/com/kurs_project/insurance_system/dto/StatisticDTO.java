package com.kurs_project.insurance_system.dto;

public class StatisticDTO {
    private Integer totalContracts;
    private Integer activeContracts;
    private Double totalRevenue;
    private Integer totalClaims;
    
    public StatisticDTO() {}
    
    public Integer getTotalContracts() { return totalContracts; }
    public void setTotalContracts(Integer totalContracts) { this.totalContracts = totalContracts; }
    
    public Integer getActiveContracts() { return activeContracts; }
    public void setActiveContracts(Integer activeContracts) { this.activeContracts = activeContracts; }
    
    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }
    
    public Integer getTotalClaims() { return totalClaims; }
    public void setTotalClaims(Integer totalClaims) { this.totalClaims = totalClaims; }
}