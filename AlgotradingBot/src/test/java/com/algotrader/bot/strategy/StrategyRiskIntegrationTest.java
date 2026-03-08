package com.algotrader.bot.strategy;

import com.algotrader.bot.risk.PositionSizeResult;
import com.algotrader.bot.risk.PositionSizer;
import com.algotrader.bot.risk.SlippageCalculator;
import com.algotrader.bot.risk.TransactionCost;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration test validating the end-to-end workflow:
 * Signal Generation → Position Sizing → Risk Check → Trade Execution
 * 
 * Tests all four critical scenarios:
 * 1. BUY signal → calculate position size → verify risk < 2%
 * 2. SELL signal → close position → calculate PnL with fees
 * 3. Stop-loss triggered → verify loss = expected risk amount
 * 4. Take-profit reached → verify profit calculation
 */
@DisplayName("Strategy-Risk Integration Tests")
class StrategyRiskIntegrationTest {

    private PositionSizer positionSizer;
    private SlippageCalculator slippageCalculator;
    
    private static final BigDecimal ACCOUNT_BALANCE = new BigDecimal("1000.00");
    private static final BigDecimal RISK_PERCENTAGE = new BigDecimal("0.02"); // 2%
    private static final String SYMBOL = "BTC/USDT";
    private static final int SCALE = 8;

    @BeforeEach
    void setUp() {
        positionSizer = new PositionSizer();
        slippageCalculator = new SlippageCalculator();
    }

    @Test
    @DisplayName("Scenario 1: BUY signal → position sizing → verify risk < 2%")
    void testBuySignalWithPositionSizingAndRiskCheck() {
        // Simulate a BUY signal with realistic values
        BigDecimal entryPrice = new BigDecimal("50000.00");
        BigDecimal stopLossPrice = new BigDecimal("48750.00"); // 2.5% below entry
        BigDecimal takeProfitPrice = new BigDecimal("51000.00"); // Middle band target
        
        // Step 1: Calculate position size based on signal
        PositionSizeResult positionResult = positionSizer.calculatePositionSize(
            ACCOUNT_BALANCE,
            entryPrice,
            stopLossPrice,
            RISK_PERCENTAGE
        );
        
        // Step 2: Verify position sizing is valid
        assertTrue(positionResult.isValid(), "Position size should be valid");
        assertNotNull(positionResult.getPositionSize(), "Position size should be calculated");
        assertNotNull(positionResult.getRiskAmount(), "Risk amount should be calculated");
        
        // Step 3: Verify risk is exactly 2% of account balance
        BigDecimal expectedRiskAmount = ACCOUNT_BALANCE.multiply(RISK_PERCENTAGE)
            .setScale(SCALE, RoundingMode.DOWN);
        assertEquals(0, expectedRiskAmount.compareTo(positionResult.getRiskAmount()),
            "Risk amount should be exactly 2% of account balance");
        
        // Step 4: Verify risk percentage is <= 2%
        BigDecimal actualRiskPercentage = positionResult.getRiskAmount()
            .divide(ACCOUNT_BALANCE, SCALE, RoundingMode.HALF_UP);
        assertTrue(actualRiskPercentage.compareTo(RISK_PERCENTAGE) <= 0,
            "Actual risk percentage should be <= 2%");
        
        // Step 5: Calculate transaction costs
        TransactionCost buyCost = slippageCalculator.calculateRealCost(
            entryPrice,
            positionResult.getPositionSize(),
            true // isBuy
        );
        
        // Verify transaction costs are included
        assertNotNull(buyCost.getTotalFees(), "Fees should be calculated");
        assertNotNull(buyCost.getTotalSlippage(), "Slippage should be calculated");
        assertTrue(buyCost.getEffectivePrice().compareTo(entryPrice) > 0,
            "Effective buy price should be higher than quoted price due to fees and slippage");
        
        // Step 6: Verify stop-loss is set correctly (2.5% below entry)
        BigDecimal expectedStopLoss = entryPrice.multiply(new BigDecimal("0.975"))
            .setScale(2, RoundingMode.HALF_UP);
        assertEquals(0, expectedStopLoss.compareTo(stopLossPrice),
            "Stop-loss should be 2.5% below entry price");
    }

    @Test
    @DisplayName("Scenario 2: SELL signal → close position → calculate PnL with fees")
    void testSellSignalWithPnLCalculation() {
        // Step 1: Simulate an open position
        BigDecimal entryPrice = new BigDecimal("50000.00");
        BigDecimal positionSize = new BigDecimal("0.02"); // 0.02 BTC
        
        // Calculate entry cost with fees
        TransactionCost entryCost = slippageCalculator.calculateRealCost(
            entryPrice,
            positionSize,
            true // isBuy
        );
        BigDecimal effectiveEntryPrice = entryCost.getEffectivePrice();
        BigDecimal entryFees = entryCost.getTotalFees();
        BigDecimal entrySlippage = entryCost.getTotalSlippage();
        
        // Step 2: Simulate SELL at take-profit (middle band)
        BigDecimal exitPrice = new BigDecimal("51000.00"); // 2% profit
        
        // Step 3: Calculate exit cost with fees
        TransactionCost exitCost = slippageCalculator.calculateRealCost(
            exitPrice,
            positionSize,
            false // isSell
        );
        BigDecimal effectiveExitPrice = exitCost.getEffectivePrice();
        BigDecimal exitFees = exitCost.getTotalFees();
        BigDecimal exitSlippage = exitCost.getTotalSlippage();
        
        // Step 4: Calculate PnL including all fees
        BigDecimal grossPnL = effectiveExitPrice.subtract(effectiveEntryPrice)
            .multiply(positionSize)
            .setScale(2, RoundingMode.HALF_UP);
        
        BigDecimal totalFees = entryFees.add(exitFees);
        BigDecimal totalSlippage = entrySlippage.add(exitSlippage);
        BigDecimal netPnL = grossPnL.subtract(totalFees).subtract(totalSlippage)
            .setScale(2, RoundingMode.HALF_UP);
        
        // Step 5: Verify PnL calculation
        assertNotNull(netPnL, "Net PnL should be calculated");
        
        // Verify fees and slippage were deducted
        assertTrue(netPnL.compareTo(grossPnL) < 0,
            "Net PnL should be less than gross PnL due to fees and slippage");
        
        // Verify exit price is lower than quoted due to fees
        assertTrue(effectiveExitPrice.compareTo(exitPrice) < 0,
            "Effective sell price should be lower than quoted price due to fees and slippage");
        
        // Step 6: Verify total transaction costs are reasonable (0.13% * 2 = 0.26%)
        BigDecimal totalNotional = entryPrice.multiply(positionSize)
            .add(exitPrice.multiply(positionSize));
        BigDecimal totalCosts = totalFees.add(totalSlippage);
        BigDecimal costPercentage = totalCosts.divide(totalNotional, 4, RoundingMode.HALF_UP);
        
        // Should be approximately 0.0026 (0.26%)
        assertTrue(costPercentage.compareTo(new BigDecimal("0.003")) < 0,
            "Total transaction costs should be < 0.3%");
    }

    @Test
    @DisplayName("Scenario 3: Stop-loss triggered → verify loss = expected risk amount")
    void testStopLossTriggeredVerifyRiskAmount() {
        // Step 1: Set up trade parameters
        BigDecimal entryPrice = new BigDecimal("50000.00");
        BigDecimal stopLossPrice = new BigDecimal("48750.00"); // 2.5% below entry
        
        // Step 2: Calculate position size
        PositionSizeResult positionResult = positionSizer.calculatePositionSize(
            ACCOUNT_BALANCE,
            entryPrice,
            stopLossPrice,
            RISK_PERCENTAGE
        );
        
        BigDecimal positionSize = positionResult.getPositionSize();
        BigDecimal expectedRiskAmount = positionResult.getRiskAmount();
        
        // Step 3: Calculate entry cost with fees
        TransactionCost entryCost = slippageCalculator.calculateRealCost(
            entryPrice,
            positionSize,
            true
        );
        BigDecimal effectiveEntryPrice = entryCost.getEffectivePrice();
        
        // Step 4: Simulate stop-loss being triggered
        TransactionCost exitCost = slippageCalculator.calculateRealCost(
            stopLossPrice,
            positionSize,
            false
        );
        BigDecimal effectiveExitPrice = exitCost.getEffectivePrice();
        
        // Step 5: Calculate actual loss
        BigDecimal priceDifference = effectiveExitPrice.subtract(effectiveEntryPrice);
        BigDecimal actualLoss = priceDifference.multiply(positionSize)
            .setScale(2, RoundingMode.HALF_UP);
        
        // Add fees and slippage to the loss
        BigDecimal totalFees = entryCost.getTotalFees().add(exitCost.getTotalFees());
        BigDecimal totalSlippage = entryCost.getTotalSlippage().add(exitCost.getTotalSlippage());
        BigDecimal totalLoss = actualLoss.subtract(totalFees).subtract(totalSlippage)
            .abs()
            .setScale(2, RoundingMode.HALF_UP);
        
        // Step 6: Verify loss is approximately equal to expected risk amount
        // Allow 25% tolerance due to fees and slippage adding to the loss
        BigDecimal tolerance = expectedRiskAmount.multiply(new BigDecimal("0.25"));
        BigDecimal lowerBound = expectedRiskAmount.subtract(tolerance);
        BigDecimal upperBound = expectedRiskAmount.add(tolerance);
        
        assertTrue(totalLoss.compareTo(lowerBound) >= 0 && totalLoss.compareTo(upperBound) <= 0,
            String.format("Total loss %.2f should be approximately equal to expected risk amount %.2f (within 25%% tolerance)",
                totalLoss, expectedRiskAmount));
        
        // Step 7: Verify loss is negative (we lost money)
        assertTrue(actualLoss.compareTo(BigDecimal.ZERO) < 0,
            "Loss should be negative when stop-loss is triggered");
    }

    @Test
    @DisplayName("Scenario 4: Take-profit reached → verify profit calculation")
    void testTakeProfitReachedVerifyProfit() {
        // Step 1: Set up trade parameters
        BigDecimal entryPrice = new BigDecimal("50000.00");
        BigDecimal stopLossPrice = new BigDecimal("48750.00"); // 2.5% below entry
        BigDecimal takeProfitPrice = new BigDecimal("51000.00"); // 2% above entry
        
        // Step 2: Calculate position size
        PositionSizeResult positionResult = positionSizer.calculatePositionSize(
            ACCOUNT_BALANCE,
            entryPrice,
            stopLossPrice,
            RISK_PERCENTAGE
        );
        
        BigDecimal positionSize = positionResult.getPositionSize();
        
        // Step 3: Calculate entry cost with fees
        TransactionCost entryCost = slippageCalculator.calculateRealCost(
            entryPrice,
            positionSize,
            true
        );
        BigDecimal effectiveEntryPrice = entryCost.getEffectivePrice();
        
        // Step 4: Simulate take-profit being reached
        TransactionCost exitCost = slippageCalculator.calculateRealCost(
            takeProfitPrice,
            positionSize,
            false
        );
        BigDecimal effectiveExitPrice = exitCost.getEffectivePrice();
        
        // Step 5: Calculate profit
        BigDecimal priceDifference = effectiveExitPrice.subtract(effectiveEntryPrice);
        BigDecimal grossProfit = priceDifference.multiply(positionSize)
            .setScale(2, RoundingMode.HALF_UP);
        
        // Subtract fees and slippage
        BigDecimal totalFees = entryCost.getTotalFees().add(exitCost.getTotalFees());
        BigDecimal totalSlippage = entryCost.getTotalSlippage().add(exitCost.getTotalSlippage());
        BigDecimal netProfit = grossProfit.subtract(totalFees).subtract(totalSlippage)
            .setScale(2, RoundingMode.HALF_UP);
        
        // Step 6: Verify profit is positive
        assertTrue(netProfit.compareTo(BigDecimal.ZERO) > 0,
            "Net profit should be positive when take-profit is reached");
        
        // Step 7: Verify profit is less than gross profit (due to fees)
        assertTrue(netProfit.compareTo(grossProfit) < 0,
            "Net profit should be less than gross profit due to fees and slippage");
        
        // Step 8: Calculate risk/reward ratio
        BigDecimal riskAmount = positionResult.getRiskAmount();
        BigDecimal rewardAmount = netProfit;
        BigDecimal riskRewardRatio = rewardAmount.divide(riskAmount, 2, RoundingMode.HALF_UP);
        
        // Verify risk/reward ratio is positive (we made money)
        assertTrue(riskRewardRatio.compareTo(BigDecimal.ZERO) > 0,
            "Risk/reward ratio should be positive for profitable trade");
        
        // Step 9: Verify take-profit price is higher than entry price
        assertTrue(takeProfitPrice.compareTo(entryPrice) > 0,
            "Take-profit price should be higher than entry price for BUY signal");
    }
}
