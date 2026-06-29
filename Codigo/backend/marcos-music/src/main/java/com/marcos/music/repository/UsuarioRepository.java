package com.marcos.music.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.marcos.music.entity.Usuario;

import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByEmailIgnoreCase(String email);
}