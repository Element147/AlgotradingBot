import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TextField,
  Typography,
} from '@mui/material';

import type {
  PaperOrder,
  PaperOrderSide,
  PaperTradingState,
} from '../paperApi';

import { FieldTooltip } from '@/components/ui/FieldTooltip';
import { formatCurrency, formatDateTime, formatNumber } from '@/utils/formatters';

interface PaperOrderFormState {
  symbol: string;
  side: PaperOrderSide;
  quantity: string;
  price: string;
  executeNow: boolean;
}

interface PaperTradingSummaryPanelProps {
  state: PaperTradingState;
}

export function PaperTradingSummaryPanel({
  state,
}: PaperTradingSummaryPanelProps) {
  const recoverySeverity =
    state.recoveryStatus === 'ATTENTION'
      ? 'warning'
      : state.recoveryStatus === 'HEALTHY'
        ? 'success'
        : 'info';

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6">Paper State</Typography>
          <Alert severity={state.paperMode ? 'success' : 'warning'}>
            {state.paperMode ? 'Paper mode active' : 'Paper mode inactive'}
          </Alert>
          <Alert severity={recoverySeverity}>{state.recoveryMessage}</Alert>
          <Typography variant="body2" color="text.secondary">
            {state.incidentSummary}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
            <Chip label={`Cash: ${formatCurrency(state.cashBalance)}`} size="small" />
            <Chip label={`Positions: ${formatNumber(state.positionCount)}`} size="small" />
            <Chip label={`Open orders: ${formatNumber(state.openOrders)}`} size="small" />
            <Chip label={`Filled: ${formatNumber(state.filledOrders)}`} size="small" />
            <Chip label={`Cancelled: ${formatNumber(state.cancelledOrders)}`} size="small" />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Last order: {state.lastOrderAt ? formatDateTime(state.lastOrderAt) : 'No orders yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last position update:{' '}
            {state.lastPositionUpdateAt
              ? formatDateTime(state.lastPositionUpdateAt)
              : 'No position changes yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Recovery status: {state.recoveryStatus} | Stale open orders:{' '}
            {formatNumber(state.staleOpenOrderCount)} | Stale positions:{' '}
            {formatNumber(state.stalePositionCount)}
          </Typography>
          <Stack spacing={1}>
            {state.alerts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No paper-trading alerts right now.
              </Typography>
            ) : (
              state.alerts.map((alert) => (
                <Alert
                  key={alert.code}
                  severity={alert.severity === 'WARNING' ? 'warning' : 'info'}
                >
                  {alert.summary} {alert.recommendedAction}
                </Alert>
              ))
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

interface PaperOrderEntryPanelProps {
  form: PaperOrderFormState;
  busy: boolean;
  onChange: (next: PaperOrderFormState) => void;
  onSubmit: () => void | Promise<void>;
}

export function PaperOrderEntryPanel({
  form,
  busy,
  onChange,
  onSubmit,
}: PaperOrderEntryPanelProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Place Paper Order</Typography>
          <Alert severity="info">
            Orders placed here stay simulated. Use `SELL` only against an open long position and
            `COVER` only against an open short position.
          </Alert>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FieldTooltip title="Provider-compatible paper symbol, for example BTC/USDT or AAPL.">
                <TextField
                  fullWidth
                  label="Symbol"
                  value={form.symbol}
                  onChange={(event) => onChange({ ...form, symbol: event.target.value })}
                />
              </FieldTooltip>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="paper-order-side-label">Side</InputLabel>
                <Select
                  labelId="paper-order-side-label"
                  value={form.side}
                  label="Side"
                  onChange={(event) =>
                    onChange({
                      ...form,
                      side: event.target.value as PaperOrderSide,
                    })
                  }
                >
                  <MenuItem value="BUY">BUY</MenuItem>
                  <MenuItem value="SELL">SELL</MenuItem>
                  <MenuItem value="SHORT">SHORT</MenuItem>
                  <MenuItem value="COVER">COVER</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FieldTooltip title="Paper quantity must be positive and reflect realistic simulated size.">
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={form.quantity}
                  onChange={(event) => onChange({ ...form, quantity: event.target.value })}
                  inputProps={{ min: 0.00000001, step: 'any' }}
                />
              </FieldTooltip>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FieldTooltip title="Reference limit/mark price used by the paper engine before fees and slippage.">
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={form.price}
                  onChange={(event) => onChange({ ...form, price: event.target.value })}
                  inputProps={{ min: 0.00000001, step: 'any' }}
                />
              </FieldTooltip>
            </Grid>
          </Grid>
          <FormControlLabel
            control={
              <Switch
                checked={form.executeNow}
                onChange={(event) =>
                  onChange({ ...form, executeNow: event.target.checked })
                }
              />
            }
            label="Execute immediately"
          />
          <Button
            variant="contained"
            startIcon={<PlayArrowOutlinedIcon />}
            onClick={() => void onSubmit()}
            disabled={busy}
          >
            Submit Paper Order
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

interface PaperOrdersPanelProps {
  orders: PaperOrder[];
  busy: boolean;
  onFill: (orderId: number) => void | Promise<void>;
  onCancel: (orderId: number) => void | Promise<void>;
}

export function PaperOrdersPanel({
  orders,
  busy,
  onFill,
  onCancel,
}: PaperOrdersPanelProps) {
  return (
    <Card>
      <CardContent>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          spacing={1}
          sx={{ mb: 2 }}
        >
          <div>
            <Typography variant="h6">Paper Orders</Typography>
            <Typography variant="body2" color="text.secondary">
              Review open, filled, and cancelled simulated orders. Only `NEW` orders can still be
              filled or cancelled.
            </Typography>
          </div>
          {busy ? <Chip label="Updating paper order" color="warning" size="small" /> : null}
        </Stack>

        {orders.length === 0 ? (
          <Alert severity="info">
            No paper orders yet. Submit one above to test fills, cancellations, and order-state
            transitions.
          </Alert>
        ) : (
          <TableContainer>
            <Table size="small" sx={{ minWidth: 1040 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Symbol</TableCell>
                <TableCell>Side</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Fill</TableCell>
                <TableCell align="right">Fees</TableCell>
                <TableCell align="right">Slippage</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{order.symbol}</TableCell>
                  <TableCell>{order.side}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell align="right">{formatNumber(order.quantity, 4)}</TableCell>
                  <TableCell align="right">{formatCurrency(order.price, 4)}</TableCell>
                  <TableCell align="right">
                    {order.fillPrice === null ? '-' : formatCurrency(order.fillPrice, 4)}
                  </TableCell>
                  <TableCell align="right">
                    {order.fees === null ? '-' : formatCurrency(order.fees, 4)}
                  </TableCell>
                  <TableCell align="right">
                    {order.slippage === null ? '-' : formatCurrency(order.slippage, 4)}
                  </TableCell>
                  <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        startIcon={<PlayArrowOutlinedIcon />}
                        disabled={busy || order.status !== 'NEW'}
                        onClick={() => void onFill(order.id)}
                      >
                        Fill
                      </Button>
                      <Button
                        size="small"
                        color="inherit"
                        startIcon={<CancelOutlinedIcon />}
                        disabled={busy || order.status !== 'NEW'}
                        onClick={() => void onCancel(order.id)}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}
