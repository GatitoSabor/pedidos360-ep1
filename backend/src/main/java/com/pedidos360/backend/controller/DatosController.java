package com.pedidos360.backend.controller;

import com.pedidos360.backend.entity.Pedido;
import com.pedidos360.backend.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200") // Mantenemos tu origen
@RestController
@RequestMapping("/api/datos") // Mantenemos tu ruta base
public class DatosController {

    @Autowired
    private PedidoRepository pedidoRepository;

    // ==========================================
    // ROL: SOLICITANTE y APROBADOR
    // ==========================================
    
    // Evolucionamos tu método obtenerDatos() para que traiga la información real
    @PreAuthorize("hasAuthority('SCOPE_solicitante') or hasAuthority('SCOPE_aprobador')")
    @GetMapping
    public List<Pedido> obtenerDatos() {
        return pedidoRepository.findAll();
    }

    // ==========================================
    // ROL: SOLICITANTE (Crear solicitudes)
    // ==========================================

    @PreAuthorize("hasAuthority('SCOPE_solicitante')")
    @PostMapping
    public Pedido crearPedido(@RequestBody Pedido pedido) {
        pedido.setEstado("PENDIENTE");
        return pedidoRepository.save(pedido);
    }
    
    // ==========================================
    // ROL: APROBADOR (Aprobar o Rechazar)
    // ==========================================

    @PreAuthorize("hasAuthority('SCOPE_aprobador')")
    @PatchMapping("/{id}/revision")
    public ResponseEntity<Pedido> revisarPedido(@PathVariable Long id, @RequestBody Pedido revision) {
        Optional<Pedido> pedidoExistente = pedidoRepository.findById(id);
        
        if (pedidoExistente.isPresent()) {
            Pedido p = pedidoExistente.get();
            p.setEstado(revision.getEstado()); // APROBADO o RECHAZADO
            p.setComentarioAprobador(revision.getComentarioAprobador());
            return ResponseEntity.ok(pedidoRepository.save(p));
        }
        return ResponseEntity.notFound().build();
    }
}