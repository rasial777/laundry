package com.laundry.laundryapp.repository;

import com.laundry.laundryapp.entity.OrderCard;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface OrderCardRepository extends JpaRepository<OrderCard, Long> {

    @Query("SELECT o FROM OrderCard o WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:laundryId IS NULL OR o.laundry.id = :laundryId) " +
           "AND (:dateFrom IS NULL OR o.createdAt >= :dateFrom) " +
           "AND (:dateTo IS NULL OR o.createdAt <= :dateTo)")
    Page<OrderCard> search(
            @Param("search") String search,
            @Param("laundryId") Long laundryId,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            Pageable pageable);

    void deleteByCreatedAtBefore(LocalDate date);
}
