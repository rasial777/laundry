package com.laundry.laundryapp.repository;

import com.laundry.laundryapp.entity.OrderPhoto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderPhotoRepository extends JpaRepository<OrderPhoto, Long> {
}
