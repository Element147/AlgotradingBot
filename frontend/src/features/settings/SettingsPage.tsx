import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import {
  resetSettings,
  selectCurrency,
  selectTheme,
  selectTimezone,
  setCurrency,
  setTheme,
  setTimezone,
} from './settingsSlice';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { AppLayout } from '@/components/layout/AppLayout';
import { selectEnvironmentMode, setEnvironmentMode } from '@/features/environment/environmentSlice';

const defaultCommandList = [
  'cd /d C:\\Git\\algotradingbot\\AlgotradingBot && docker compose -f compose.yaml up -d postgres',
  'cd /d C:\\Git\\algotradingbot\\AlgotradingBot && gradlew.bat clean build',
  'cd /d C:\\Git\\algotradingbot\\AlgotradingBot && gradlew.bat bootRun',
  'cd /d C:\\Git\\algotradingbot\\frontend && npm run build',
  'cd /d C:\\Git\\algotradingbot\\frontend && npm run dev',
];

const RESEARCH_DEFAULTS_KEY = 'research_defaults';

interface ResearchDefaults {
  initialBalance: string;
  feesBps: string;
  slippageBps: string;
}

const readResearchDefaults = (): ResearchDefaults => {
  const fallback = {
    initialBalance: '10000',
    feesBps: '10',
    slippageBps: '3',
  };

  const raw = localStorage.getItem(RESEARCH_DEFAULTS_KEY);
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ResearchDefaults>;
    return {
      initialBalance: parsed.initialBalance ?? fallback.initialBalance,
      feesBps: parsed.feesBps ?? fallback.feesBps,
      slippageBps: parsed.slippageBps ?? fallback.slippageBps,
    };
  } catch {
    return fallback;
  }
};

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const currency = useAppSelector(selectCurrency);
  const timezone = useAppSelector(selectTimezone);
  const environmentMode = useAppSelector(selectEnvironmentMode);

  const [feedback, setFeedback] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);
  const [researchDefaults, setResearchDefaults] = useState<ResearchDefaults>(readResearchDefaults());

  const timezoneOptions = useMemo(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const options = ['UTC', detected, 'Europe/Prague', 'America/New_York', 'Asia/Tokyo'];
    return Array.from(new Set(options));
  }, []);

  const copyCommand = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setFeedback({ severity: 'success', message: 'Command copied to clipboard.' });
    } catch {
      setFeedback({ severity: 'error', message: 'Clipboard copy failed. You can still copy manually.' });
    }
  };

  const saveResearchDefaults = () => {
    const initialBalance = Number(researchDefaults.initialBalance);
    const fees = Number(researchDefaults.feesBps);
    const slippage = Number(researchDefaults.slippageBps);

    if (!Number.isFinite(initialBalance) || initialBalance < 100) {
      setFeedback({ severity: 'error', message: 'Initial balance should be >= 100.' });
      return;
    }
    if (!Number.isFinite(fees) || fees < 0 || fees > 200) {
      setFeedback({ severity: 'error', message: 'Fees should be between 0 and 200 bps.' });
      return;
    }
    if (!Number.isFinite(slippage) || slippage < 0 || slippage > 200) {
      setFeedback({ severity: 'error', message: 'Slippage should be between 0 and 200 bps.' });
      return;
    }

    localStorage.setItem(RESEARCH_DEFAULTS_KEY, JSON.stringify(researchDefaults));
    setFeedback({ severity: 'success', message: 'Research defaults saved.' });
  };

  return (
    <AppLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Local-first configuration for paper trading, backtesting, and safe development workflow.
        </Typography>

        {feedback ? (
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)} sx={{ mb: 2 }}>
            {feedback.message}
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>User Preferences</Typography>
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel id="theme-label">Theme</InputLabel>
                    <Select
                      labelId="theme-label"
                      value={theme}
                      label="Theme"
                      onChange={(event) => dispatch(setTheme(event.target.value))}
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel id="currency-label">Currency Display</InputLabel>
                    <Select
                      labelId="currency-label"
                      value={currency}
                      label="Currency Display"
                      onChange={(event) => dispatch(setCurrency(event.target.value))}
                    >
                      <MenuItem value="USD">USD (fiat view)</MenuItem>
                      <MenuItem value="BTC">BTC (crypto unit view)</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel id="timezone-label">Timezone</InputLabel>
                    <Select
                      labelId="timezone-label"
                      value={timezone}
                      label="Timezone"
                      onChange={(event) => dispatch(setTimezone(event.target.value))}
                    >
                      {timezoneOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button variant="outlined" color="warning" onClick={() => dispatch(resetSettings())}>
                    Reset Preferences
                  </Button>

                  <Typography variant="caption" color="text.secondary">
                    These values are stored in your browser localStorage and never sent to exchange APIs.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Environment Safety</Typography>
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel id="environment-label">Active Mode</InputLabel>
                    <Select
                      labelId="environment-label"
                      value={environmentMode}
                      label="Active Mode"
                      onChange={(event) => dispatch(setEnvironmentMode(event.target.value))}
                    >
                      <MenuItem value="test">Test / Paper (recommended)</MenuItem>
                      <MenuItem value="live">Live data view</MenuItem>
                    </Select>
                  </FormControl>

                  <Alert severity={environmentMode === 'test' ? 'success' : 'warning'}>
                    {environmentMode === 'test'
                      ? 'Safe mode is active. Strategy actions are intended for paper/test workflows.'
                      : 'Live mode should be used carefully. Keep strict risk limits and operator approval.'}
                  </Alert>

                  <Typography variant="body2" color="text.secondary">
                    Build/test commands should never depend on Docker DB. Runtime app (`bootRun`) should use PostgreSQL in Docker.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Research Defaults</Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Default Initial Balance"
                    type="number"
                    value={researchDefaults.initialBalance}
                    onChange={(event) => setResearchDefaults((prev) => ({ ...prev, initialBalance: event.target.value }))}
                    helperText="Starting capital for local backtest experiments."
                  />
                  <TextField
                    label="Default Fees (bps)"
                    type="number"
                    value={researchDefaults.feesBps}
                    onChange={(event) => setResearchDefaults((prev) => ({ ...prev, feesBps: event.target.value }))}
                    helperText="Transaction cost in basis points (10 bps = 0.10%)."
                  />
                  <TextField
                    label="Default Slippage (bps)"
                    type="number"
                    value={researchDefaults.slippageBps}
                    onChange={(event) => setResearchDefaults((prev) => ({ ...prev, slippageBps: event.target.value }))}
                    helperText="Expected execution drift vs. signal price."
                  />

                  <Button variant="contained" onClick={saveResearchDefaults}>Save Research Defaults</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Local Commands (CMD)</Typography>
                <Stack spacing={1.5}>
                  {defaultCommandList.map((command, index) => (
                    <Box key={command} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">Command {index + 1}</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', mb: 1 }}>
                        {command}
                      </Typography>
                      <Button size="small" startIcon={<ContentCopyIcon />} onClick={() => void copyCommand(command)}>
                        Copy
                      </Button>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>Backtest Data Workflow</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Recommended local workflow for 2-3 year historical testing:
                </Typography>
                <Typography variant="body2">1. Import historical candles into PostgreSQL (manual SQL or future CSV uploader).</Typography>
                <Typography variant="body2">2. Keep at least 2-3 years for each tested symbol/timeframe to reduce overfitting risk.</Typography>
                <Typography variant="body2">3. Use realistic fees/slippage in every backtest run.</Typography>
                <Typography variant="body2">4. Treat results as hypothesis evidence, not guaranteed profitability.</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AppLayout>
  );
}
