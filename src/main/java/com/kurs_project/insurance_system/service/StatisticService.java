package com.kurs_project.insurance_system.service;

import com.kurs_project.insurance_system.repository.ClientRepository;
import com.kurs_project.insurance_system.repository.ContractRepository;
import com.kurs_project.insurance_system.repository.PaymentRepository;
import com.kurs_project.insurance_system.repository.StatisticRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StatisticService {
    
    private final ClientRepository clientRepository;
    private final ContractRepository contractRepository;
    private final PaymentRepository paymentRepository;
    private final StatisticRepository statisticRepository;
    
    public Map<String, Object> getDashboardStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // Основные показатели
        stats.put("totalClients", clientRepository.countAll());
        stats.put("totalContracts", contractRepository.countAll());
        
        // Количество договоров по типам
        Map<String, Long> contractsByType = new LinkedHashMap<>();
        contractsByType.put("CASCO", contractRepository.countByInsuranceType("CASCO"));
        contractsByType.put("OSAGO", contractRepository.countByInsuranceType("OSAGO"));
        contractsByType.put("LIFE", contractRepository.countByInsuranceType("LIFE"));
        contractsByType.put("PROPERTY", contractRepository.countByInsuranceType("PROPERTY"));
        stats.put("contractsByType", contractsByType);
        
        // Средние премии
        Map<String, Double> avgPremiums = new LinkedHashMap<>();
        avgPremiums.put("CASCO", contractRepository.findAveragePremiumByType("CASCO"));
        avgPremiums.put("OSAGO", contractRepository.findAveragePremiumByType("OSAGO"));
        avgPremiums.put("LIFE", contractRepository.findAveragePremiumByType("LIFE"));
        avgPremiums.put("PROPERTY", contractRepository.findAveragePremiumByType("PROPERTY"));
        stats.put("averagePremiums", avgPremiums);
        
        // Статистика за последние 6 месяцев
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
        List<Object[]> monthlyStats = statisticRepository.getMonthlyContractStatistics(sixMonthsAgo);
        stats.put("monthlyContractStats", formatMonthlyStats(monthlyStats));
        
        // Общая сумма страховых премий
        BigDecimal totalPremiums = calculateTotalPremiums();
        stats.put("totalPremiums", totalPremiums);
        
        // Оплаченные суммы
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate endOfMonth = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        BigDecimal monthlyPayments = paymentRepository.getTotalAmountByPeriod(startOfMonth, endOfMonth);
        stats.put("monthlyPayments", monthlyPayments != null ? monthlyPayments : BigDecimal.ZERO);
        
        // Динамика премий по месяцам
        List<Object[]> premiumByMonth = statisticRepository.getPremiumByMonth(sixMonthsAgo);
        stats.put("premiumTrend", formatPremiumTrend(premiumByMonth));
        
        return stats;
    }
    
    private BigDecimal calculateTotalPremiums() {
        Double cascoAvg = contractRepository.findAveragePremiumByType("CASCO");
        Double osagoAvg = contractRepository.findAveragePremiumByType("OSAGO");
        Double lifeAvg = contractRepository.findAveragePremiumByType("LIFE");
        Double propertyAvg = contractRepository.findAveragePremiumByType("PROPERTY");
        
        long cascoCount = contractRepository.countByInsuranceType("CASCO");
        long osagoCount = contractRepository.countByInsuranceType("OSAGO");
        long lifeCount = contractRepository.countByInsuranceType("LIFE");
        long propertyCount = contractRepository.countByInsuranceType("PROPERTY");
        
        BigDecimal total = BigDecimal.ZERO;
        if (cascoAvg != null) total = total.add(BigDecimal.valueOf(cascoAvg * cascoCount));
        if (osagoAvg != null) total = total.add(BigDecimal.valueOf(osagoAvg * osagoCount));
        if (lifeAvg != null) total = total.add(BigDecimal.valueOf(lifeAvg * lifeCount));
        if (propertyAvg != null) total = total.add(BigDecimal.valueOf(propertyAvg * propertyCount));
        
        return total;
    }
    
    private List<Map<String, Object>> formatMonthlyStats(List<Object[]> monthlyStats) {
        List<Map<String, Object>> formatted = new ArrayList<>();
        for (Object[] row : monthlyStats) {
            Map<String, Object> monthStat = new HashMap<>();
            monthStat.put("month", row[0]);
            monthStat.put("year", row[1]);
            monthStat.put("count", row[2]);
            formatted.add(monthStat);
        }
        return formatted;
    }
    
    private List<Map<String, Object>> formatPremiumTrend(List<Object[]> premiumByMonth) {
        List<Map<String, Object>> formatted = new ArrayList<>();
        for (Object[] row : premiumByMonth) {
            Map<String, Object> premiumStat = new HashMap<>();
            premiumStat.put("month", row[0]);
            premiumStat.put("totalPremium", row[1]);
            formatted.add(premiumStat);
        }
        return formatted;
    }
    
    public Map<String, Object> getFilteredStatistics(LocalDate startDate, LocalDate endDate, String insuranceType) {
        Map<String, Object> stats = new HashMap<>();
        
        // TODO: Реализовать фильтрованную статистику
        
        return stats;
    }
}