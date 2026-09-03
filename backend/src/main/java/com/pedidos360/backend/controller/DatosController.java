package com.pedidos360.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/datos")
public class DatosController {

    @GetMapping
    public String obtenerDatos() {
        return "{\"mensaje\": \"¡Conexión segura establecida con Spring Boot!\"}";
    }
}