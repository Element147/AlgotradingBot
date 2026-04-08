package com.algotrader.bot.marketdata.infrastructure.persistence.repository;

import com.algotrader.bot.marketdata.infrastructure.persistence.entity.MarketDataProviderCredential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MarketDataProviderCredentialRepository extends JpaRepository<MarketDataProviderCredential, Long> {

    Optional<MarketDataProviderCredential> findByProviderId(String providerId);

    void deleteByProviderId(String providerId);
}
