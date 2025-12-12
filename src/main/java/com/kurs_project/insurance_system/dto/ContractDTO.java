package com.kurs_project.insurance_system.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ContractDTO {
    private Long id;
    
    private String contractNumber;
    
    @NotNull(message = "Клиент обязателен")
    private Long clientId;
    
    @NotBlank(message = "Тип страхования обязателен")
    private String insuranceTypeCode;
    
    @NotNull(message = "Дата начала обязательна")
    @FutureOrPresent(message = "Дата начала не может быть в прошлом")
    private LocalDate startDate;
    
    @NotNull(message = "Дата окончания обязательна")
    @Future(message = "Дата окончания должна быть в будущем")
    private LocalDate endDate;
    
    @NotNull(message = "Страховая премия обязательна")
    @DecimalMin(value = "0.0", inclusive = false, message = "Страховая премия должна быть больше 0")
    private BigDecimal premiumAmount;
    
    @NotNull(message = "Страховая сумма обязательна")
    @DecimalMin(value = "0.0", inclusive = false, message = "Страховая сумма должна быть больше 0")
    private BigDecimal insuredAmount;
    
    // Данные для специфичных типов страхования
    private String vehicleModel;
    private Integer manufactureYear;
    private BigDecimal vehicleCost;
    private Boolean hasFranchise;
    private BigDecimal franchiseAmount;
    private LocalDate birthDate;
    private String gender;
    private String profession;
    private String healthStatus;
    private String propertyType;
    private String address;
    private BigDecimal area;
    private Integer constructionYear;
    private BigDecimal propertyCost;
}