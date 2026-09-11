package com.laundry.laundryapp.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "order_cards")
public class OrderCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String orderNumber;

    @Column(nullable = false)
    private LocalDate createdAt;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String wearLevel;

    @Column(columnDefinition = "TEXT")
    private String defects;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "laundry_id", nullable = false)
    private Laundry laundry;

    @OneToMany(mappedBy = "orderCard", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderPhoto> photos = new ArrayList<>();

    public OrderCard() {
    }

    public OrderCard(String orderNumber, LocalDate createdAt, String description, Laundry laundry) {
        this.orderNumber = orderNumber;
        this.createdAt = createdAt;
        this.description = description;
        this.laundry = laundry;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getWearLevel() {
        return wearLevel;
    }

    public void setWearLevel(String wearLevel) {
        this.wearLevel = wearLevel;
    }

    public String getDefects() {
        return defects;
    }

    public void setDefects(String defects) {
        this.defects = defects;
    }

    public Laundry getLaundry() {
        return laundry;
    }

    public void setLaundry(Laundry laundry) {
        this.laundry = laundry;
    }

    public List<OrderPhoto> getPhotos() {
        return photos;
    }

    public void setPhotos(List<OrderPhoto> photos) {
        this.photos = photos;
    }
}
