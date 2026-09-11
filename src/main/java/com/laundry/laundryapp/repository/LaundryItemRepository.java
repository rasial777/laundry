package com.laundry.laundryapp.repository;

import com.laundry.laundryapp.entity.LaundryItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LaundryItemRepository extends JpaRepository<LaundryItem, Long> {
}