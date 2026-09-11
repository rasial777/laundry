package com.laundry.laundryapp.controller;

import com.laundry.laundryapp.dto.OrderCardRequest;
import com.laundry.laundryapp.dto.OrderCardResponse;
import com.laundry.laundryapp.dto.PhotoResponse;
import com.laundry.laundryapp.entity.OrderCard;
import com.laundry.laundryapp.entity.OrderPhoto;
import com.laundry.laundryapp.entity.Laundry;
import com.laundry.laundryapp.repository.LaundryRepository;
import com.laundry.laundryapp.repository.OrderCardRepository;
import com.laundry.laundryapp.repository.OrderPhotoRepository;
import com.laundry.laundryapp.service.OrderCardService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cards")
public class OrderCardController {

    private final OrderCardRepository orderCardRepository;
    private final LaundryRepository laundryRepository;
    private final OrderPhotoRepository orderPhotoRepository;
    private final OrderCardService orderCardService;

    public OrderCardController(OrderCardRepository orderCardRepository,
                               LaundryRepository laundryRepository,
                               OrderPhotoRepository orderPhotoRepository,
                               OrderCardService orderCardService) {
        this.orderCardRepository = orderCardRepository;
        this.laundryRepository = laundryRepository;
        this.orderPhotoRepository = orderPhotoRepository;
        this.orderCardService = orderCardService;
    }

    @GetMapping
    public ResponseEntity<?> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long laundryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        String[] sortParts = sort.split(",");
        String sortField = sortParts[0];
        Sort.Direction direction = sortParts.length > 1 && "asc".equalsIgnoreCase(sortParts[1])
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));

        Page<OrderCard> result = orderCardRepository.search(search, laundryId, dateFrom, dateTo, pageable);
        Page<OrderCardResponse> response = result.map(this::toResponse);
        return ResponseEntity.ok(Map.of(
                "content", response.getContent(),
                "totalElements", response.getTotalElements(),
                "totalPages", response.getTotalPages(),
                "page", response.getNumber(),
                "size", response.getSize()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderCardResponse> getById(@PathVariable Long id) {
        return orderCardRepository.findById(id)
                .map(card -> ResponseEntity.ok(toResponse(card)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody OrderCardRequest request) {
        if (request.orderNumber() == null || request.orderNumber().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Номер заказа обязателен"));
        }
        if (request.laundryId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Прачечная обязательна"));
        }
        Laundry laundry = laundryRepository.findById(request.laundryId())
                .orElseThrow(() -> new IllegalArgumentException("Прачечная не найдена"));

        OrderCard card = new OrderCard(
                request.orderNumber().trim(),
                request.createdAt() != null ? request.createdAt() : LocalDate.now(),
                request.description() != null ? request.description() : "",
                laundry
        );
        card.setWearLevel(request.wearLevel());
        card.setDefects(request.defects());
        OrderCard saved = orderCardRepository.save(card);
        return ResponseEntity.ok(toResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody OrderCardRequest request) {
        OrderCard card = orderCardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Карточка не найдена"));

        if (request.orderNumber() != null && !request.orderNumber().isBlank()) {
            card.setOrderNumber(request.orderNumber().trim());
        }
        if (request.createdAt() != null) {
            card.setCreatedAt(request.createdAt());
        }
        if (request.description() != null) {
            card.setDescription(request.description());
        }
        if (request.wearLevel() != null) {
            card.setWearLevel(request.wearLevel());
        }
        if (request.defects() != null) {
            card.setDefects(request.defects());
        }
        if (request.laundryId() != null) {
            Laundry laundry = laundryRepository.findById(request.laundryId())
                    .orElseThrow(() -> new IllegalArgumentException("Прачечная не найдена"));
            card.setLaundry(laundry);
        }
        return ResponseEntity.ok(toResponse(orderCardRepository.save(card)));
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        var card = orderCardRepository.findById(id).orElse(null);
        if (card == null) {
            return ResponseEntity.notFound().build();
        }
        orderCardService.deletePhotos(card);
        orderCardRepository.delete(card);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/photos")
    public ResponseEntity<?> uploadPhoto(@PathVariable Long id,
                                         @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Файл пустой"));
        }
        var card = orderCardRepository.findById(id).orElse(null);
        if (card == null) {
            return ResponseEntity.notFound().build();
        }
        String filename = orderCardService.storePhoto(file, card);
        orderCardRepository.save(card);
        return ResponseEntity.ok(new PhotoResponse(card.getPhotos().get(card.getPhotos().size() - 1).getId(), filename));
    }

    @DeleteMapping("/{cardId}/photos/{photoId}")
    public ResponseEntity<Void> deletePhoto(@PathVariable Long cardId, @PathVariable Long photoId) {
        var photo = orderPhotoRepository.findById(photoId).orElse(null);
        if (photo == null || !photo.getOrderCard().getId().equals(cardId)) {
            return ResponseEntity.notFound().build();
        }
        photo.getOrderCard().getPhotos().removeIf(p -> p.getId().equals(photoId));
        orderCardService.deletePhoto(photo);
        return ResponseEntity.noContent().build();
    }

    private OrderCardResponse toResponse(OrderCard card) {
        List<PhotoResponse> photos = card.getPhotos().stream()
                .map(p -> new PhotoResponse(p.getId(), p.getFilename()))
                .toList();
        return new OrderCardResponse(
                card.getId(),
                card.getOrderNumber(),
                card.getCreatedAt(),
                card.getDescription(),
                card.getWearLevel(),
                card.getDefects(),
                new com.laundry.laundryapp.dto.LaundryResponse(card.getLaundry().getId(), card.getLaundry().getName()),
                photos
        );
    }
}