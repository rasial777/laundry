package com.laundry.laundryapp.repository;

import com.laundry.laundryapp.entity.Laundry;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LaundryRepository extends JpaRepository<Laundry, Long> {
}
