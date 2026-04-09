import type { ColumnDef } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
  InteractiveTable,
  useInteractiveTableState,
} from './InteractiveTable';

interface TestRow {
  id: number;
  name: string;
  status: string;
}

const rows: TestRow[] = [
  { id: 1, name: 'Alpha', status: 'Open' },
  { id: 2, name: 'Beta', status: 'Closed' },
];

const columns: ColumnDef<TestRow>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    enableHiding: false,
    meta: {
      filterVariant: 'none',
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
    meta: {
      filterVariant: 'text',
      filterPlaceholder: 'Name',
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: {
      filterVariant: 'text',
      filterPlaceholder: 'Status',
    },
  },
];

function TestTable() {
  const stateControls = useInteractiveTableState({
    tableId: 'interactive-table-test',
    initialPageSize: 10,
  });

  return (
    <InteractiveTable
      title="Test table"
      data={rows}
      columns={columns}
      stateControls={stateControls}
      emptyTitle="Empty"
      emptyDescription="No rows"
      getRowId={(row) => String(row.id)}
    />
  );
}

describe('InteractiveTable', () => {
  it('persists column visibility and restores it on reload', async () => {
    const user = userEvent.setup();
    const firstRender = render(<TestTable />);

    await user.click(screen.getByRole('button', { name: /Columns/i }));
    await user.click(await screen.findByRole('menuitem', { name: 'Name' }));

    expect(screen.queryByRole('button', { name: 'Name' })).not.toBeInTheDocument();
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();

    const storedState = JSON.parse(
      window.localStorage.getItem('interactive-table:interactive-table-test') ?? '{}'
    );
    expect(storedState.columnVisibility).toMatchObject({ name: false });

    firstRender.unmount();
    render(<TestTable />);

    expect(screen.queryByRole('button', { name: 'Name' })).not.toBeInTheDocument();
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Columns/i }));
    await user.click(await screen.findByRole('menuitem', { name: 'Restore defaults' }));

    expect(screen.getByRole('button', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  }, 15000);
});
