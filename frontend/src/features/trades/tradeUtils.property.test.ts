import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import type { TradeHistoryItem } from './tradesApi';
import {
  buildTradesCsv,
  calculateRMultiple,
  isIsoTimestamp,
  sortTrades,
} from './tradeUtils';

const tradeArbitrary = fc.record<TradeHistoryItem>({
  id: fc.integer({ min: 1, max: 100000 }),
  pair: fc.constantFrom('BTC/USDT', 'ETH/USDT'),
  entryTime: fc.date().map((date) => date.toISOString()),
  entryPrice: fc.double({ min: 1, max: 100000, noNaN: true }),
  exitTime: fc.option(fc.date().map((date) => date.toISOString()), { nil: null }),
  exitPrice: fc.option(fc.double({ min: 1, max: 100000, noNaN: true }), { nil: null }),
  signal: fc.constantFrom('BUY', 'SELL'),
  positionSize: fc.double({ min: 0.0001, max: 10, noNaN: true }),
  riskAmount: fc.double({ min: 0.01, max: 1000, noNaN: true }),
  pnl: fc.double({ min: -1000, max: 1000, noNaN: true }),
  feesActual: fc.double({ min: 0, max: 100, noNaN: true }),
  slippageActual: fc.double({ min: 0, max: 100, noNaN: true }),
  stopLoss: fc.option(fc.double({ min: 1, max: 100000, noNaN: true }), { nil: null }),
  takeProfit: fc.option(fc.double({ min: 1, max: 100000, noNaN: true }), { nil: null }),
});

describe('trade utils properties', () => {
  it('sortTrades sorts ascending by id correctly', () => {
    fc.assert(
      fc.property(fc.array(tradeArbitrary, { minLength: 2, maxLength: 100 }), (trades) => {
        const sorted = sortTrades(trades, 'id', 'asc');
        for (let index = 1; index < sorted.length; index += 1) {
          expect(sorted[index - 1].id).toBeLessThanOrEqual(sorted[index].id);
        }
      }),
      { numRuns: 120 }
    );
  });

  it('calculateRMultiple follows formula when values are available', () => {
    fc.assert(
      fc.property(
        tradeArbitrary.filter(
          (trade) =>
            trade.exitPrice !== null &&
            trade.stopLoss !== null &&
            trade.entryPrice !== trade.stopLoss
        ),
        (trade) => {
          const expected =
            (trade.exitPrice! - trade.entryPrice) / (trade.entryPrice - trade.stopLoss!);
          expect(calculateRMultiple(trade)).toBeCloseTo(expected, 10);
        }
      ),
      { numRuns: 120 }
    );
  });

  it('csv export always includes headers first', () => {
    fc.assert(
      fc.property(fc.array(tradeArbitrary, { minLength: 1, maxLength: 25 }), (trades) => {
        const csv = buildTradesCsv(trades);
        const [firstLine] = csv.split('\n');
        expect(firstLine).toContain('"id"');
        expect(firstLine).toContain('"pair"');
      }),
      { numRuns: 120 }
    );
  });

  it('csv monetary fields keep 2 decimal places', () => {
    fc.assert(
      fc.property(fc.array(tradeArbitrary, { minLength: 1, maxLength: 25 }), (trades) => {
        const csv = buildTradesCsv(trades);
        const lines = csv.split('\n').slice(1);
        const moneyRegex = /^-?\d+\.\d{2}$/;

        for (const line of lines) {
          const columns = line.split(',');
          expect(moneyRegex.test(columns[9].replaceAll('"', ''))).toBe(true);
          expect(moneyRegex.test(columns[10].replaceAll('"', ''))).toBe(true);
          expect(moneyRegex.test(columns[11].replaceAll('"', ''))).toBe(true);
        }
      }),
      { numRuns: 120 }
    );
  });

  it('entry and exit timestamps in csv are ISO-8601 compatible', () => {
    fc.assert(
      fc.property(fc.array(tradeArbitrary, { minLength: 1, maxLength: 25 }), (trades) => {
        const csv = buildTradesCsv(trades);
        const lines = csv.split('\n').slice(1);
        for (const line of lines) {
          const columns = line.split(',');
          const entry = columns[3].replaceAll('"', '');
          const exit = columns[4].replaceAll('"', '');
          expect(isIsoTimestamp(entry)).toBe(true);
          if (exit) {
            expect(isIsoTimestamp(exit)).toBe(true);
          }
        }
      }),
      { numRuns: 120 }
    );
  });
});
