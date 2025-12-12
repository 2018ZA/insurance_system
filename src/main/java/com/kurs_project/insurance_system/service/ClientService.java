package com.kurs_project.insurance_system.service;

import com.kurs_project.insurance_system.dto.ClientDTO;
import com.kurs_project.insurance_system.entity.Client;
import com.kurs_project.insurance_system.repository.ClientRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ClientService {
    
    private final ClientRepository clientRepository;
    
    public Page<Client> getAllClients(Pageable pageable) {
        return clientRepository.findAll(pageable);
    }
    
    public Page<Client> searchClients(String searchTerm, Pageable pageable) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return clientRepository.findAll(pageable);
        }
        
        // Проверяем, является ли поиск по паспортным данным
        if (searchTerm.matches("\\d{4}\\s*\\d{6}")) {
            String[] parts = searchTerm.split("\\s+");
            if (parts.length == 2) {
                Client client = clientRepository.findByPassportData(parts[0], parts[1]);
                if (client != null) {
                    return Page.empty(pageable);
                }
            }
        }
        
        return clientRepository.findByFullNameContainingIgnoreCase(searchTerm, pageable);
    }
    
    public Client getClientById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Клиент не найден"));
    }
    
    @Transactional
    public Client createClient(ClientDTO clientDTO) {
        // Проверка уникальности телефона
        if (clientRepository.existsByPhone(clientDTO.getPhone())) {
            throw new RuntimeException("Клиент с таким телефоном уже существует");
        }
        
        // Проверка уникальности паспортных данных
        if (clientDTO.getPassportSeries() != null && clientDTO.getPassportNumber() != null) {
            if (clientRepository.existsByPassportSeriesAndPassportNumber(
                    clientDTO.getPassportSeries(), clientDTO.getPassportNumber())) {
                throw new RuntimeException("Клиент с такими паспортными данными уже существует");
            }
        }
        
        Client client = new Client();
        client.setFullName(clientDTO.getFullName());
        client.setPassportSeries(clientDTO.getPassportSeries());
        client.setPassportNumber(clientDTO.getPassportNumber());
        client.setPhone(clientDTO.getPhone());
        client.setEmail(clientDTO.getEmail());
        client.setRegistrationDate(LocalDateTime.now());
        
        return clientRepository.save(client);
    }
    
    @Transactional
    public Client updateClient(Long id, ClientDTO clientDTO) {
        Client client = getClientById(id);
        
        // Проверка уникальности телефона (кроме текущего клиента)
        if (!client.getPhone().equals(clientDTO.getPhone())) {
            if (clientRepository.existsByPhone(clientDTO.getPhone())) {
                throw new RuntimeException("Клиент с таким телефоном уже существует");
            }
        }
        
        // Проверка уникальности паспортных данных
        if (clientDTO.getPassportSeries() != null && clientDTO.getPassportNumber() != null) {
            Client existingByPassport = clientRepository.findByPassportData(
                    clientDTO.getPassportSeries(), clientDTO.getPassportNumber());
            if (existingByPassport != null && !existingByPassport.getId().equals(id)) {
                throw new RuntimeException("Клиент с такими паспортными данными уже существует");
            }
        }
        
        client.setFullName(clientDTO.getFullName());
        client.setPassportSeries(clientDTO.getPassportSeries());
        client.setPassportNumber(clientDTO.getPassportNumber());
        client.setPhone(clientDTO.getPhone());
        client.setEmail(clientDTO.getEmail());
        
        return clientRepository.save(client);
    }
    
    @Transactional
    public void deleteClient(Long id) {
        Client client = getClientById(id);
        
        // Проверка наличия активных договоров
        if (client.getContracts() != null && !client.getContracts().isEmpty()) {
            boolean hasActiveContracts = client.getContracts().stream()
                    .anyMatch(c -> "ACTIVE".equals(c.getStatus().getCode()));
            
            if (hasActiveContracts) {
                throw new RuntimeException("Невозможно удалить клиента с активными договорами");
            }
        }
        
        clientRepository.delete(client);
    }
    
    public long getClientCount() {
        return clientRepository.countAll();
    }
}