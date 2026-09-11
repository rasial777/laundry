package com.laundry.laundryapp.controller;

import com.laundry.laundryapp.entity.LaundryItem;
import com.laundry.laundryapp.repository.LaundryItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class LaundryItemController {

    private final LaundryItemRepository repository;

    public LaundryItemController(LaundryItemRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<LaundryItem> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<LaundryItem> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public LaundryItem create(@RequestBody LaundryItem item) {
        return repository.save(item);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}