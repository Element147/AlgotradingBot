package com.algotrader.bot.paper.infrastructure.persistence;

import com.algotrader.bot.paper.infrastructure.persistence.PaperOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaperOrderRepository extends JpaRepository<PaperOrder, Long> {
    List<PaperOrder> findByAccountIdOrderByCreatedAtDesc(Long accountId);

    long countByAccountIdAndStatus(Long accountId, PaperOrder.Status status);
}
