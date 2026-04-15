package com.marcos.music.repository;

import com.marcos.music.entity.LoginHistory;
import com.marcos.music.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, UUID> {

    Optional<LoginHistory> findTopByUsuarioOrderByTimestampDesc(Usuario usuario);
}
