package com.algotrader.bot.service;

import com.algotrader.bot.controller.PaperOrderRequest;
import com.algotrader.bot.controller.PaperOrderResponse;
import com.algotrader.bot.controller.PaperTradingStateResponse;
import com.algotrader.bot.entity.Account;
import com.algotrader.bot.entity.PaperOrder;
import com.algotrader.bot.entity.Portfolio;
import com.algotrader.bot.entity.Trade;
import com.algotrader.bot.repository.AccountRepository;
import com.algotrader.bot.repository.PaperOrderRepository;
import com.algotrader.bot.repository.PortfolioRepository;
import com.algotrader.bot.repository.TradeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaperTradingService {

    private static final BigDecimal FEE_RATE = new BigDecimal("0.001");
    private static final BigDecimal SLIPPAGE_RATE = new BigDecimal("0.0003");

    private final PaperOrderRepository paperOrderRepository;
    private final AccountRepository accountRepository;
    private final PortfolioRepository portfolioRepository;
    private final TradeRepository tradeRepository;
    private final OperatorAuditService operatorAuditService;

    public PaperTradingService(PaperOrderRepository paperOrderRepository,
                               AccountRepository accountRepository,
                               PortfolioRepository portfolioRepository,
                               TradeRepository tradeRepository,
                               OperatorAuditService operatorAuditService) {
        this.paperOrderRepository = paperOrderRepository;
        this.accountRepository = accountRepository;
        this.portfolioRepository = portfolioRepository;
        this.tradeRepository = tradeRepository;
        this.operatorAuditService = operatorAuditService;
    }

    @Transactional
    public PaperOrderResponse placeOrder(PaperOrderRequest request) {
        Account account = resolveAccount();

        PaperOrder order = new PaperOrder(
            account.getId(),
            request.symbol(),
            PaperOrder.Side.valueOf(request.side().toUpperCase()),
            request.quantity(),
            request.price()
        );

        PaperOrder saved = paperOrderRepository.save(order);

        if (Boolean.TRUE.equals(request.executeNow())) {
            saved = fillOrderInternal(saved.getId());
        }

        operatorAuditService.recordSuccess(
            "PAPER_ORDER_PLACED",
            "paper",
            "PAPER_ORDER",
            String.valueOf(saved.getId()),
            "symbol=" + saved.getSymbol() + ", side=" + saved.getSide().name() + ", status=" + saved.getStatus().name()
        );

        return mapToResponse(saved);
    }

    @Transactional
    public PaperOrderResponse fillOrder(Long orderId) {
        PaperOrder filled = fillOrderInternal(orderId);
        operatorAuditService.recordSuccess(
            "PAPER_ORDER_FILLED",
            "paper",
            "PAPER_ORDER",
            String.valueOf(filled.getId()),
            "symbol=" + filled.getSymbol() + ", side=" + filled.getSide().name()
        );
        return mapToResponse(filled);
    }

    private PaperOrder fillOrderInternal(Long orderId) {
        PaperOrder order = paperOrderRepository.findById(orderId)
            .orElseThrow(() -> new EntityNotFoundException("Paper order not found: " + orderId));

        if (!PaperOrder.Status.NEW.equals(order.getStatus())) {
            throw new IllegalArgumentException("Only NEW orders can be filled");
        }

        Account account = accountRepository.findById(order.getAccountId())
            .orElseThrow(() -> new EntityNotFoundException("Account not found for order: " + orderId));

        BigDecimal notional = order.getPrice().multiply(order.getQuantity());
        BigDecimal fees = notional.multiply(FEE_RATE).setScale(8, RoundingMode.HALF_UP);
        BigDecimal slippage = notional.multiply(SLIPPAGE_RATE).setScale(8, RoundingMode.HALF_UP);

        BigDecimal fillPrice;
        if (order.getSide() == PaperOrder.Side.BUY) {
            fillPrice = order.getPrice().multiply(BigDecimal.ONE.add(SLIPPAGE_RATE)).setScale(8, RoundingMode.HALF_UP);
            BigDecimal totalCost = fillPrice.multiply(order.getQuantity()).add(fees);
            if (account.getCurrentBalance().compareTo(totalCost) < 0) {
                throw new IllegalArgumentException("Insufficient paper balance");
            }

            account.setCurrentBalance(account.getCurrentBalance().subtract(totalCost));
            upsertPosition(account.getId(), order.getSymbol(), order.getQuantity(), fillPrice, true);
            accountRepository.save(account);
            createTradeRecord(account.getId(), order, fillPrice, fees, slippage, BigDecimal.ZERO);
        } else {
            fillPrice = order.getPrice().multiply(BigDecimal.ONE.subtract(SLIPPAGE_RATE)).setScale(8, RoundingMode.HALF_UP);
            Portfolio position = portfolioRepository.findByAccountIdAndSymbol(account.getId(), order.getSymbol())
                .orElseThrow(() -> new IllegalArgumentException("No open position to sell"));

            if (position.getPositionSize().compareTo(order.getQuantity()) < 0) {
                throw new IllegalArgumentException("Sell quantity exceeds open position size");
            }

            BigDecimal proceeds = fillPrice.multiply(order.getQuantity()).subtract(fees);
            account.setCurrentBalance(account.getCurrentBalance().add(proceeds));

            BigDecimal remaining = position.getPositionSize().subtract(order.getQuantity());
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
                portfolioRepository.delete(position);
            } else {
                position.setPositionSize(remaining);
                position.setCurrentPrice(fillPrice);
                portfolioRepository.save(position);
            }

            accountRepository.save(account);
            BigDecimal pnl = fillPrice.subtract(position.getAverageEntryPrice())
                .multiply(order.getQuantity())
                .subtract(fees)
                .subtract(slippage)
                .setScale(8, RoundingMode.HALF_UP);
            account.setTotalPnl(account.getTotalPnl().add(pnl));
            accountRepository.save(account);

            createTradeRecord(account.getId(), order, fillPrice, fees, slippage, pnl);
        }

        order.setStatus(PaperOrder.Status.FILLED);
        order.setFillPrice(fillPrice);
        order.setFees(fees);
        order.setSlippage(slippage);
        order.setFilledAt(LocalDateTime.now());

        return paperOrderRepository.save(order);
    }

    @Transactional
    public PaperOrderResponse cancelOrder(Long orderId) {
        PaperOrder order = paperOrderRepository.findById(orderId)
            .orElseThrow(() -> new EntityNotFoundException("Paper order not found: " + orderId));

        if (!PaperOrder.Status.NEW.equals(order.getStatus())) {
            throw new IllegalArgumentException("Only NEW orders can be cancelled");
        }

        order.setStatus(PaperOrder.Status.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());
        PaperOrder saved = paperOrderRepository.save(order);
        operatorAuditService.recordSuccess(
            "PAPER_ORDER_CANCELLED",
            "paper",
            "PAPER_ORDER",
            String.valueOf(saved.getId()),
            "symbol=" + saved.getSymbol() + ", side=" + saved.getSide().name()
        );
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PaperOrderResponse> listOrders() {
        Account account = resolveAccount();
        return paperOrderRepository.findByAccountIdOrderByCreatedAtDesc(account.getId()).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public PaperTradingStateResponse getState() {
        Account account = resolveAccount();
        List<PaperOrder> orders = paperOrderRepository.findByAccountIdOrderByCreatedAtDesc(account.getId());

        Long total = (long) orders.size();
        Long open = paperOrderRepository.countByAccountIdAndStatus(account.getId(), PaperOrder.Status.NEW);
        Long filled = paperOrderRepository.countByAccountIdAndStatus(account.getId(), PaperOrder.Status.FILLED);
        Long cancelled = paperOrderRepository.countByAccountIdAndStatus(account.getId(), PaperOrder.Status.CANCELLED);
        int positions = portfolioRepository.findByAccountId(account.getId()).size();
        LocalDateTime lastOrder = orders.isEmpty() ? null : orders.get(0).getCreatedAt();

        return new PaperTradingStateResponse(
            true,
            account.getCurrentBalance(),
            positions,
            total,
            open,
            filled,
            cancelled,
            lastOrder
        );
    }

    private void upsertPosition(Long accountId, String symbol, BigDecimal quantity, BigDecimal fillPrice, boolean isBuy) {
        if (!isBuy) {
            return;
        }

        Portfolio position = portfolioRepository.findByAccountIdAndSymbol(accountId, symbol)
            .orElseGet(() -> new Portfolio(accountId, symbol, BigDecimal.ZERO, fillPrice, fillPrice));

        BigDecimal newSize = position.getPositionSize().add(quantity);
        BigDecimal newAverage = BigDecimal.ZERO;
        if (newSize.compareTo(BigDecimal.ZERO) > 0) {
            newAverage = position.getAverageEntryPrice().multiply(position.getPositionSize())
                .add(fillPrice.multiply(quantity))
                .divide(newSize, 8, RoundingMode.HALF_UP);
        }

        position.setPositionSize(newSize);
        position.setAverageEntryPrice(newAverage.max(fillPrice));
        position.setCurrentPrice(fillPrice);
        portfolioRepository.save(position);
    }

    private void createTradeRecord(Long accountId,
                                   PaperOrder order,
                                   BigDecimal fillPrice,
                                   BigDecimal fees,
                                   BigDecimal slippage,
                                   BigDecimal pnl) {
        Trade trade = new Trade(
            accountId,
            order.getSymbol(),
            order.getSide() == PaperOrder.Side.BUY ? Trade.SignalType.BUY : Trade.SignalType.SELL,
            LocalDateTime.now(),
            fillPrice,
            order.getQuantity(),
            fillPrice.multiply(order.getQuantity()).multiply(new BigDecimal("0.02")),
            fillPrice.multiply(new BigDecimal("0.98")),
            fillPrice.multiply(new BigDecimal("1.02")),
            fees,
            slippage
        );
        trade.setExitTime(LocalDateTime.now());
        trade.setExitPrice(fillPrice);
        trade.setPnl(pnl);
        tradeRepository.save(trade);
    }

    private PaperOrderResponse mapToResponse(PaperOrder order) {
        return new PaperOrderResponse(
            order.getId(),
            order.getSymbol(),
            order.getSide().name(),
            order.getStatus().name(),
            order.getQuantity(),
            order.getPrice(),
            order.getFillPrice(),
            order.getFees(),
            order.getSlippage(),
            order.getCreatedAt()
        );
    }

    private Account resolveAccount() {
        return accountRepository.findTopByOrderByCreatedAtDesc()
            .orElseGet(() -> accountRepository.save(new Account(
                new BigDecimal("10000.00"),
                new BigDecimal("0.02"),
                new BigDecimal("0.25")
            )));
    }
}
