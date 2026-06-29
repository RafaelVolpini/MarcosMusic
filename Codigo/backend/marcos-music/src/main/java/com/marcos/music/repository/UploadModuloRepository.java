package com.marcos.music.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.marcos.music.entity.UploadModulo;

@Repository
public interface UploadModuloRepository extends JpaRepository<UploadModulo, Long>{
    
}
