package com.laundry.laundryapp.dto;

import java.time.LocalDate;

public record OrderCardRequest(
    String orderNumber,
    LocalDate createdAt,
    String description,
    String wearLevel,
    String defects,
    Long laundryId
) {}