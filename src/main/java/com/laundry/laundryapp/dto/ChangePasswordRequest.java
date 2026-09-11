package com.laundry.laundryapp.dto;

public record ChangePasswordRequest(String oldPassword, String newPassword) {}
