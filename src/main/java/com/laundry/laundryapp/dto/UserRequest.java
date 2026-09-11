package com.laundry.laundryapp.dto;

import com.laundry.laundryapp.entity.Role;

public record UserRequest(String username, String password, Role role) {}
