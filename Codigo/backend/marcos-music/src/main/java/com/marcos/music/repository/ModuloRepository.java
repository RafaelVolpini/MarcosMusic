package com.marcos.music.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.marcos.music.entity.Modulo;

@Repository
public interface ModuloRepository extends JpaRepository<Modulo, Long>{
    
}
