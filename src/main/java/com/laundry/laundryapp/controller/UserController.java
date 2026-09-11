package com.laundry.laundryapp.controller;

import com.laundry.laundryapp.dto.AdminChangePasswordRequest;
import com.laundry.laundryapp.dto.ChangePasswordRequest;
import com.laundry.laundryapp.dto.UserRequest;
import com.laundry.laundryapp.dto.UserResponse;
import com.laundry.laundryapp.entity.User;
import com.laundry.laundryapp.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> list() {
        return ResponseEntity.ok(userRepository.findAll().stream()
                .map(u -> new UserResponse(u.getId(), u.getUsername(), u.getRole(), u.isEnabled()))
                .toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody UserRequest request) {
        if (request.username() == null || request.username().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Имя пользователя обязательно"));
        }
        if (request.password() == null || request.password().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Пароль обязателен"));
        }
        if (userRepository.existsByUsername(request.username().trim())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Пользователь уже существует"));
        }
        User user = new User(
                request.username().trim(),
                passwordEncoder.encode(request.password()),
                request.role() != null ? request.role() : com.laundry.laundryapp.entity.Role.MANAGER
        );
        User saved = userRepository.save(user);
        return ResponseEntity.ok(new UserResponse(saved.getId(), saved.getUsername(), saved.getRole(), saved.isEnabled()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody AdminChangePasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
        if (request.role() != null) {
            user.setRole(request.role());
        }
        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.newPassword()));
        }
        User saved = userRepository.save(user);
        return ResponseEntity.ok(new UserResponse(saved.getId(), saved.getUsername(), saved.getRole(), saved.isEnabled()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody ChangePasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Неверный текущий пароль"));
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Пароль изменён"));
    }
}