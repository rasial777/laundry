package com.laundry.laundryapp;

import com.laundry.laundryapp.entity.Laundry;
import com.laundry.laundryapp.entity.Role;
import com.laundry.laundryapp.entity.User;
import com.laundry.laundryapp.repository.LaundryRepository;
import com.laundry.laundryapp.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@EnableScheduling
public class LaundryApplication {

    public static void main(String[] args) {
        SpringApplication.run(LaundryApplication.class, args);
    }

    @Bean
    CommandLineRunner initData(UserRepository userRepository,
                               LaundryRepository laundryRepository,
                               PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByUsername("admin")) {
                userRepository.save(new User("admin", passwordEncoder.encode("admin"), Role.ADMIN));
            }
            if (laundryRepository.count() == 0) {
                laundryRepository.save(new Laundry("Прачечная №1"));
                laundryRepository.save(new Laundry("Прачечная №2"));
            }
        };
    }
}
