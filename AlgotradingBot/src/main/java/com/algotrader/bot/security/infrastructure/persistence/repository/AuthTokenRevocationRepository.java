package com.algotrader.bot.security.infrastructure.persistence.repository;

import com.algotrader.bot.security.infrastructure.persistence.entity.AuthTokenRevocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface AuthTokenRevocationRepository extends JpaRepository<AuthTokenRevocation, Long> {

    boolean existsByTokenHash(String tokenHash);

    void deleteByExpiresAtBefore(LocalDateTime cutoff);
}
