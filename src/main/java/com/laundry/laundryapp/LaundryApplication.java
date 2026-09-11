package com.laundry.laundryapp;

import com.laundry.laundryapp.entity.LaundryItem;
import com.laundry.laundryapp.repository.LaundryItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;

@SpringBootApplication
public class LaundryApplication {

    public static void main(String[] args) {
        SpringApplication.run(LaundryApplication.class, args);
    }

    @Bean
    CommandLineRunner initData(LaundryItemRepository repository) {
        return args -> {
            repository.save(new LaundryItem("Рубашка", new BigDecimal("150.00")));
            repository.save(new LaundryItem("Брюки", new BigDecimal("200.00")));
            repository.save(new LaundryItem("Пальто", new BigDecimal("350.00")));
        };
    }
}