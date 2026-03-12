import { Alert, Card, CardContent, Chip, Stack, Typography } from '@mui/material';

import {
  formatAuditActionLabel,
  formatAuditTargetLabel,
  getAuditOutcomeColor,
} from '@/features/settings/auditPresentation';
import { useGetAuditEventsQuery } from '@/features/settings/exchangeApi';
import { formatDateTime } from '@/utils/formatters';

export function OperatorAuditCard() {
  const { data, isLoading, isError } = useGetAuditEventsQuery(
    { limit: 6 },
    { pollingInterval: 30000, skipPollingIfUnfocused: true }
  );

  const events = data?.events ?? [];
  const summary = data?.summary;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Operator Audit
        </Typography>

        {isLoading ? <Typography variant="body2">Loading audit timeline...</Typography> : null}
        {isError ? <Alert severity="error">Unable to load audit events.</Alert> : null}

        {summary ? (
          <Alert severity={summary.failedCount > 0 ? 'warning' : 'info'} sx={{ mb: 1.5 }}>
            {summary.visibleEventCount} recent events | {summary.successCount} success | {summary.failedCount} failed
          </Alert>
        ) : null}

        {!isLoading && !isError && events.length === 0 ? (
          <Typography variant="body2">No operator audit events recorded yet.</Typography>
        ) : null}

        <Stack spacing={1}>
          {events.slice(0, 4).map((event) => (
            <Card key={event.id} variant="outlined">
              <CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                  <Typography variant="subtitle2">{formatAuditActionLabel(event.action)}</Typography>
                  <Chip size="small" label={event.outcome} color={getAuditOutcomeColor(event.outcome)} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {event.actor} | {formatAuditTargetLabel(event)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {event.environment} | {formatDateTime(event.createdAt)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
          Open Settings {'>'} Audit Trail for filters, detail chips, and copy actions.
        </Typography>
      </CardContent>
    </Card>
  );
}
