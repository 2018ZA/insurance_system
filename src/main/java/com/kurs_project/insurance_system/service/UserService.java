package com.kurs_project.insurance_system.service;

import com.kurs_project.insurance_system.entity.User;
import com.kurs_project.insurance_system.entity.UserRole;
import com.kurs_project.insurance_system.repository.UserRepository;
import com.kurs_project.insurance_system.repository.UserRoleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> getUserByLogin(String login) {
        return userRepository.findByLogin(login);
    }
    
    @Transactional
    public User createUser(String login, String password, String fullName, String roleCode) {
        if (userRepository.existsByLogin(login)) {
            throw new RuntimeException("Пользователь с таким логином уже существует");
        }
        
        UserRole role = userRoleRepository.findById(roleCode)
                .orElseThrow(() -> new RuntimeException("Роль не найдена"));
        
        User user = new User();
        user.setLogin(login);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setRole(role);
        user.setActive(true);
        
        return userRepository.save(user);
    }
    
    @Transactional
    public User updateUser(Long id, String fullName, String roleCode, Boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        UserRole role = userRoleRepository.findById(roleCode)
                .orElseThrow(() -> new RuntimeException("Роль не найдена"));
        
        user.setFullName(fullName);
        user.setRole(role);
        user.setActive(active);
        
        return userRepository.save(user);
    }
    
    @Transactional
    public void changePassword(Long id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
    
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        // Проверка, что пользователь не удаляет сам себя (должна быть в контроллере)
        userRepository.delete(user);
    }
    
    public boolean validateCredentials(String login, String password) {
        return userRepository.findByLogin(login)
                .map(user -> passwordEncoder.matches(password, user.getPassword()))
                .orElse(false);
    }
    
    public List<UserRole> getAllRoles() {
        return userRoleRepository.findAll();
    }
    
    public long getUserCount() {
        return userRepository.count();
    }
}