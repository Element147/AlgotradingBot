package com.algotrader.bot.exchange.infrastructure.persistence;

import com.algotrader.bot.exchange.infrastructure.persistence.ExchangeConnectionProfile;
import com.algotrader.bot.security.infrastructure.persistence.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExchangeConnectionProfileRepository extends JpaRepository<ExchangeConnectionProfile, String> {

    List<ExchangeConnectionProfile> findByUserOrderByCreatedAtAsc(User user);

    Optional<ExchangeConnectionProfile> findByUserAndId(User user, String id);
}
