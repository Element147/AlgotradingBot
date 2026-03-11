package com.algotrader.bot.repository;

import com.algotrader.bot.entity.OperatorAuditEvent;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OperatorAuditEventRepository extends JpaRepository<OperatorAuditEvent, Long> {
    List<OperatorAuditEvent> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
