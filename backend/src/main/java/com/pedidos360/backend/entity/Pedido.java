package com.pedidos360.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String descripcion;
    private Double montoTotal;
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    // ==========================================
    // NUEVOS CAMPOS PARA FLUJO DE APROBACIÓN
    // ==========================================
    
    // Por defecto, toda nueva solicitud nace como PENDIENTE
    private String estado = "PENDIENTE"; 
    
    // Almacenará la justificación del jefe/aprobador
    private String comentarioAprobador;

    // ==========================================

    public Pedido() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    
    public Double getMontoTotal() { return montoTotal; }
    public void setMontoTotal(Double montoTotal) { this.montoTotal = montoTotal; }
    
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    
    public String getComentarioAprobador() { return comentarioAprobador; }
    public void setComentarioAprobador(String comentarioAprobador) { this.comentarioAprobador = comentarioAprobador; }
}