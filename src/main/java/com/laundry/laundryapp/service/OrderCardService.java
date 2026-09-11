package com.laundry.laundryapp.service;

import com.laundry.laundryapp.entity.OrderCard;
import com.laundry.laundryapp.entity.OrderPhoto;
import com.laundry.laundryapp.repository.OrderCardRepository;
import com.laundry.laundryapp.repository.OrderPhotoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class OrderCardService {

    private final OrderCardRepository orderCardRepository;
    private final OrderPhotoRepository orderPhotoRepository;
    private final Path uploadDir;

    public OrderCardService(OrderCardRepository orderCardRepository,
                            OrderPhotoRepository orderPhotoRepository,
                            @Value("${app.upload-dir:./uploads}") String uploadDir) {
        this.orderCardRepository = orderCardRepository;
        this.orderPhotoRepository = orderPhotoRepository;
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Не удалось создать директорию для загрузок", e);
        }
    }

    public String storePhoto(MultipartFile file, OrderCard card) {
        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf("."));
        }
        String filename = UUID.randomUUID() + ext;
        Path target = uploadDir.resolve(filename).normalize();
        if (!target.startsWith(uploadDir)) {
            throw new RuntimeException("Недопустимое имя файла");
        }
        try {
            file.transferTo(target);
        } catch (IOException e) {
            throw new RuntimeException("Не удалось сохранить файл", e);
        }
        OrderPhoto photo = new OrderPhoto(filename, card);
        orderPhotoRepository.save(photo);
        card.getPhotos().add(photo);
        return filename;
    }

    public Path loadPhoto(String filename) {
        Path target = uploadDir.resolve(filename).normalize();
        if (!target.startsWith(uploadDir) || !Files.exists(target)) {
            return null;
        }
        return target;
    }

    public void deletePhoto(OrderPhoto photo) {
        try {
            Files.deleteIfExists(uploadDir.resolve(photo.getFilename()));
        } catch (IOException ignored) {
        }
        orderPhotoRepository.delete(photo);
    }

    public void deletePhotos(OrderCard card) {
        for (OrderPhoto photo : card.getPhotos()) {
            deletePhoto(photo);
        }
    }

    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupOldCards() {
        LocalDate cutoff = LocalDate.now().minusYears(1);
        var oldCards = orderCardRepository.findAll();
        for (OrderCard card : oldCards) {
            if (card.getCreatedAt().isBefore(cutoff)) {
                deletePhotos(card);
                orderCardRepository.delete(card);
            }
        }
    }
}