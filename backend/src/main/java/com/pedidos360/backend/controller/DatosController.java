package com.pedidos360.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:4200") // Autoriza a tu React a consumir este endpoint
@RestController
@RequestMapping("/api/datos")
public class DatosController {

    @GetMapping
    public String obtenerDatos() {
        return "{\"mensaje\": \"¡Conexión segura establecida con Spring Boot! Tu token es válido.\"}";
    }
}