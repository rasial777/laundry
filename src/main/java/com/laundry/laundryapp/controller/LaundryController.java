package com.laundry.laundryapp.controller;

import com.laundry.laundryapp.dto.LaundryRequest;
import com.laundry.laundryapp.dto.LaundryResponse;
import com.laundry.laundryapp.entity.Laundry;
import com.laundry.laundryapp.repository.LaundryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/laundries")
public class LaundryController {

    private final LaundryRepository laundryRepository;

    public LaundryController(LaundryRepository laundryRepository) {
        this.laundryRepository = laundryRepository;
    }

    @GetMapping
    public ResponseEntity<List<LaundryResponse>> list() {
        return ResponseEntity.ok(laundryRepository.findAll().stream()
                .map(l -> new LaundryResponse(l.getId(), l.getName()))
                .toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody LaundryRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Название обязательно"));
        }
        Laundry laundry = new Laundry(request.name().trim());
        Laundry saved = laundryRepository.save(laundry);
        return ResponseEntity.ok(new LaundryResponse(saved.getId(), saved.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        laundryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}