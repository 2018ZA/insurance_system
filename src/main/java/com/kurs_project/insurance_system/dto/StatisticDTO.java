package com.kurs_project.insurance_system.dto;

import .Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class StatisticDTO {
    private Long totalClients;
    private Long totalContracts;
    private BigDecimal totalPremiums;
    private BigDecimal monthlyPayments;
    private Map<String, Long> contractsByType;
    private Map<String, Double> averagePremiums;
    private Map<String, Long> contractsByStatus;
    
    @Data
    public static class MonthlyStat {
        private Integer month;
        private Integer year;
        private Long count;
    }
    
    @Data
    public static class PremiumTrend {
        private String month;
        private BigDecimal totalPremium;
    }
}