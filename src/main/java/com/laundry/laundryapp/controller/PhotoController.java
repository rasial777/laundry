package com.laundry.laundryapp.controller;

import com.laundry.laundryapp.service.OrderCardService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;

@RestController
@RequestMapping("/api/photos")
public class PhotoController {

    private final OrderCardService orderCardService;

    public PhotoController(OrderCardService orderCardService) {
        this.orderCardService = orderCardService;
    }

    @GetMapping("/{filename}")
    public ResponseEntity<Resource> getPhoto(@PathVariable String filename) {
        Path path = orderCardService.loadPhoto(filename);
        if (path == null) {
            return ResponseEntity.notFound().build();
        }
        try {
            Resource resource = new UrlResource(path.toUri());
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
