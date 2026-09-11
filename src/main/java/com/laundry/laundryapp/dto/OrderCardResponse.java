package com.laundry.laundryapp.dto;

import java.time.LocalDate;
import java.util.List;

public record OrderCardResponse(
    Long id,
    String orderNumber,
    LocalDate createdAt,
    String description,
    String wearLevel,
    String defects,
    LaundryResponse laundry,
    List<PhotoResponse> photos
) {}