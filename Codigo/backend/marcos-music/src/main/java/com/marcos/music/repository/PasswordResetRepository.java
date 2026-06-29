package com.marcos.music.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.marcos.music.dto.ResetPassword.PasswordResetStatus;
import com.marcos.music.entity.PasswordReset;

public interface PasswordResetRepository extends JpaRepository<PasswordReset, UUID>{
    Optional<PasswordReset> findFirstByEmailAndVerificationCodeAndStatusOrderByCreatedAtDesc(
            String email,
            String verificationCode,
            PasswordResetStatus status
    );
    
}
