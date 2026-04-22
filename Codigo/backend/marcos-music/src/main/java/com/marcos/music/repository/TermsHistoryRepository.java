package com.marcos.music.repository;

import com.marcos.music.entity.TermsHistory;
import com.marcos.music.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TermsHistoryRepository extends JpaRepository<TermsHistory, UUID> {

    Optional<TermsHistory> findTopByUsuarioOrderByTimestampDesc(Usuario usuario);
}
