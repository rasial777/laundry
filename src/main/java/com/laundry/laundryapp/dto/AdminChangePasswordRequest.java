package com.laundry.laundryapp.dto;

import com.laundry.laundryapp.entity.Role;

public record AdminChangePasswordRequest(String newPassword, Role role) {}
