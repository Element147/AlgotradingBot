import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { BacktestVirtualizedTradeTable } from './BacktestVirtualizedTradeTable';

const rows = [
  {
    id: 'btc-1',
    symbol: 'BTC/USDT',
    side: 'LONG' as const,
    entryTime: '2025-01-01T10:00:00',
    exitTime: '2025-01-01T12:00:00',
    quantity: 1.25,
    entryPrice: 100,
    exitPrice: 110,
    pnlValue: 10,
    returnPct: 10,
  },
];

describe('BacktestVirtualizedTradeTable', () => {
  it('migrates legacy widths and persists column visibility in the unified table preferences key', async () => {
    window.localStorage.setItem(
      'interactive-table:backtest-trade-review-widths',
      JSON.stringify({ symbol: 222 })
    );

    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const onRowSelect = vi.fn();
    const firstRender = render(
      <BacktestVirtualizedTradeTable
        rows={rows}
        selectedTradeId={null}
        sortField="entryTime"
        sortDirection="desc"
        onSortChange={onSortChange}
        onRowSelect={onRowSelect}
      />
    );

    const storedAfterMount = JSON.parse(
      window.localStorage.getItem('interactive-table:backtest-trade-review') ?? '{}'
    );
    expect(storedAfterMount.columnSizing).toMatchObject({ symbol: 222 });

    await user.click(screen.getByRole('button', { name: /Columns/i }));
    await user.click(await screen.findByRole('menuitem', { name: 'Return' }));

    expect(screen.queryByRole('button', { name: 'Sort by Return' })).not.toBeInTheDocument();

    firstRender.unmount();
    render(
      <BacktestVirtualizedTradeTable
        rows={rows}
        selectedTradeId={null}
        sortField="entryTime"
        sortDirection="desc"
        onSortChange={onSortChange}
        onRowSelect={onRowSelect}
      />
    );

    expect(screen.queryByRole('button', { name: 'Sort by Return' })).not.toBeInTheDocument();

    const storedAfterReload = JSON.parse(
      window.localStorage.getItem('interactive-table:backtest-trade-review') ?? '{}'
    );
    expect(storedAfterReload.columnSizing).toMatchObject({ symbol: 222 });
    expect(storedAfterReload.columnVisibility).toMatchObject({ returnPct: false });
  }, 15000);
});
