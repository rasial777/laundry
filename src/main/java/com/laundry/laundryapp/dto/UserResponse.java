package com.laundry.laundryapp.dto;

import com.laundry.laundryapp.entity.Role;

public record UserResponse(Long id, String username, Role role, boolean enabled) {}
