import { Alert, Box, Grid, Typography } from '@mui/material';
import { useState } from 'react';

import {
  PaperOrderEntryPanel,
  PaperOrdersPanel,
  PaperTradingSummaryPanel,
} from './PaperTradingPanels';

import { useAppSelector } from '@/app/hooks';
import { AppLayout } from '@/components/layout/AppLayout';
import { selectEnvironmentMode } from '@/features/environment/environmentSlice';
import {
  type PaperOrderSide,
  useCancelPaperOrderMutation,
  useFillPaperOrderMutation,
  useGetPaperOrdersQuery,
  useGetPaperTradingStateQuery,
  usePlacePaperOrderMutation,
} from '@/features/paperApi';
import { getApiErrorMessage } from '@/services/api';
import { sanitizeText } from '@/utils/security';

type PaperOrderFormState = {
  symbol: string;
  side: PaperOrderSide;
  quantity: string;
  price: string;
  executeNow: boolean;
};

const DEFAULT_FORM: PaperOrderFormState = {
  symbol: 'BTC/USDT',
  side: 'BUY',
  quantity: '0.05',
  price: '50000',
  executeNow: true,
};

export default function PaperTradingPage() {
  const environmentMode = useAppSelector(selectEnvironmentMode);
  const { data: state, isLoading: isStateLoading, isError: isStateError } =
    useGetPaperTradingStateQuery(undefined, {
      pollingInterval: 15000,
      skipPollingIfUnfocused: true,
    });
  const { data: orders = [], isLoading: isOrdersLoading, isError: isOrdersError } =
    useGetPaperOrdersQuery(undefined, {
      pollingInterval: 10000,
      skipPollingIfUnfocused: true,
    });
  const [placeOrder, { isLoading: isPlacing }] = usePlacePaperOrderMutation();
  const [fillOrder, { isLoading: isFilling }] = useFillPaperOrderMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelPaperOrderMutation();
  const [form, setForm] = useState<PaperOrderFormState>(DEFAULT_FORM);
  const [feedback, setFeedback] = useState<{ severity: 'success' | 'error'; message: string } | null>(
    null
  );

  const orderMutationBusy = isPlacing || isFilling || isCancelling;

  const onSubmitOrder = async () => {
    const quantity = Number(form.quantity);
    const price = Number(form.price);
    if (!form.symbol.trim()) {
      setFeedback({ severity: 'error', message: 'Symbol is required.' });
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFeedback({ severity: 'error', message: 'Quantity must be greater than zero.' });
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setFeedback({ severity: 'error', message: 'Price must be greater than zero.' });
      return;
    }

    try {
      const response = await placeOrder({
        symbol: form.symbol.trim(),
        side: form.side,
        quantity,
        price,
        executeNow: form.executeNow,
      }).unwrap();
      setFeedback({
        severity: 'success',
        message: `Paper order #${response.id} submitted with status ${response.status}.`,
      });
      setForm((current) => ({
        ...current,
        symbol: form.symbol.trim(),
      }));
    } catch (error) {
      setFeedback({ severity: 'error', message: getApiErrorMessage(error) });
    }
  };

  const onFillOrder = async (orderId: number) => {
    try {
      const response = await fillOrder(orderId).unwrap();
      setFeedback({
        severity: 'success',
        message: `Paper order #${response.id} filled at ${response.fillPrice ?? response.price}.`,
      });
    } catch (error) {
      setFeedback({ severity: 'error', message: getApiErrorMessage(error) });
    }
  };

  const onCancelOrder = async (orderId: number) => {
    try {
      const response = await cancelOrder(orderId).unwrap();
      setFeedback({
        severity: 'success',
        message: `Paper order #${response.id} cancelled.`,
      });
    } catch (error) {
      setFeedback({ severity: 'error', message: getApiErrorMessage(error) });
    }
  };

  return (
    <AppLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Paper Trading Desk
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Submit, fill, and cancel simulated orders without routing anything to a live exchange.
        </Typography>

        {environmentMode === 'live' ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            The UI is currently set to `live`, but this desk still uses paper-only backend workflows.
            Orders placed here remain simulated and are not sent to an exchange.
          </Alert>
        ) : null}

        {feedback ? (
          <Alert severity={feedback.severity} sx={{ mb: 2 }} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 5 }}>
            <PaperOrderEntryPanel
              form={form}
              busy={orderMutationBusy}
              onChange={(next) =>
                setForm({
                  ...next,
                  symbol: sanitizeText(next.symbol),
                })
              }
              onSubmit={onSubmitOrder}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 7 }}>
            {isStateLoading ? <Typography>Loading paper state...</Typography> : null}
            {isStateError ? (
              <Alert severity="error">Unable to load paper-trading state.</Alert>
            ) : null}
            {state ? <PaperTradingSummaryPanel state={state} /> : null}
          </Grid>
          <Grid size={{ xs: 12 }}>
            {isOrdersLoading ? <Typography>Loading paper orders...</Typography> : null}
            {isOrdersError ? (
              <Alert severity="error">Unable to load paper orders.</Alert>
            ) : null}
            {!isOrdersLoading && !isOrdersError ? (
              <PaperOrdersPanel
                orders={orders}
                busy={orderMutationBusy}
                onFill={onFillOrder}
                onCancel={onCancelOrder}
              />
            ) : null}
          </Grid>
        </Grid>
      </Box>
    </AppLayout>
  );
}
