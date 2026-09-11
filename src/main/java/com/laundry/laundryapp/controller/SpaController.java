package com.laundry.laundryapp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping(value = {"/", "/login", "/cards", "/cards/**", "/settings"})
    public String index() {
        return "forward:/index.html";
    }
}