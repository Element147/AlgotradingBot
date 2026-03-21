import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import ReplayIcon from '@mui/icons-material/Replay';
import TableRowsIcon from '@mui/icons-material/TableRows';
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { BacktestDetails } from './backtestApi';
import { getPreferredTelemetrySymbol } from './backtestTelemetry';
import {
  formatBacktestMarketLabel,
  type BacktestSymbolTelemetry,
} from './backtestTypes';
import {
  createDrawdownCurve,
  createEquityCurve,
  createMonthlyReturns,
  createTradeDistribution,
} from './backtestVisualization';
import {
  actionVisuals,
  buildOverlayLegend,
  buildWorkspaceMarkers,
  buildWorkspaceTrades,
  deriveWorkspaceFocusTime,
  findMarkerById,
  findTradeByMarkerId,
  getDefaultVisibleOverlayKeys,
  summarizeMarkerFilter,
  type BacktestMarkerFilter,
} from './backtestWorkspace';
import { BacktestWorkspaceChart } from './BacktestWorkspaceChart';
import { MonthlyReturnsHeatmap } from './MonthlyReturnsHeatmap';
import { TradeDistributionHistogram } from './TradeDistributionHistogram';

import { DrawdownChart } from '@/components/charts/DrawdownChart';
import { EquityCurve } from '@/components/charts/EquityCurve';
import { KeyValueGrid } from '@/components/ui/KeyValueGrid';
import {
  EmptyState,
  LegendList,
  MetricCard,
  NumericText,
  RouteActionBar,
  StatusPill,
  SurfacePanel,
} from '@/components/ui/Workbench';
import { StickyInspectorPanel } from '@/components/workspace/StickyInspectorPanel';
import {
  formatCurrency,
  formatDateTime,
  formatDistanceToNow,
  formatNumber,
  formatPercentage,
} from '@/utils/formatters';

interface BacktestResultsProps {
  details: BacktestDetails;
  transportLabel?: string;
  lastLiveEventAt?: string | null;
  transportError?: string | null;
  onDelete?: () => void;
  deleteDisabled?: boolean;
  onReplay?: () => void;
  onFocusHistory?: () => void;
}

interface BacktestResearchWorkspaceProps {
  details: BacktestDetails;
  activeTelemetry: BacktestSymbolTelemetry;
  selectedTelemetrySymbol: string;
  onTelemetrySelect: (symbol: string) => void;
}

const workspaceMarkerFilters: BacktestMarkerFilter[] = [
  'ALL',
  'LONG',
  'SHORT',
  'EXITS',
  'FORCED',
];
const workspacePaneKeys = ['exposure', 'oscillator'] as const;

const parseWorkspaceMarkerFilter = (value: string | null): BacktestMarkerFilter =>
  workspaceMarkerFilters.find((item) => item === value) ?? 'ALL';

const parseParamList = (
  value: string | null,
  allowed: readonly string[],
  fallback: string[]
) => {
  if (value === null) {
    return fallback;
  }

  if (value === 'none') {
    return [];
  }

  const parsed = value
    .split(',')
    .map((item) => item.trim())
    .filter((item): item is string => Boolean(item) && allowed.includes(item));

  return parsed.length > 0 ? parsed : fallback;
};

const validationTone = (status: BacktestDetails['validationStatus']) => {
  if (status === 'PASSED' || status === 'PRODUCTION_READY') {
    return 'success';
  }
  if (status === 'FAILED') {
    return 'error';
  }
  return 'warning';
};

const formatLiveEventLabel = (value: string | null | undefined) =>
  value ? formatDistanceToNow(new Date(value)) : 'No live progress event received yet';

function BacktestResearchWorkspace({
  details,
  activeTelemetry,
  selectedTelemetrySymbol,
  onTelemetrySelect,
}: BacktestResearchWorkspaceProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const overlayLegend = useMemo(
    () => buildOverlayLegend(activeTelemetry),
    [activeTelemetry]
  );
  const workspaceTrades = useMemo(
    () => buildWorkspaceTrades(details, activeTelemetry.symbol, activeTelemetry.actions),
    [activeTelemetry, details]
  );
  const workspaceMarkers = useMemo(
    () => buildWorkspaceMarkers(workspaceTrades),
    [workspaceTrades]
  );
  const updateWorkspaceParams = (update: (params: URLSearchParams) => void) => {
    const nextParams = new URLSearchParams(searchParams);
    update(nextParams);
    setSearchParams(nextParams, { replace: true });
  };
  const selectedTradeId = searchParams.get('trade');
  const selectedMarkerId = searchParams.get('marker');
  const markerFilter = parseWorkspaceMarkerFilter(searchParams.get('filter'));
  const overlayKeys = overlayLegend.map((item) => item.key);
  const resolvedOverlayKeys = parseParamList(
    searchParams.get('overlays'),
    overlayKeys,
    getDefaultVisibleOverlayKeys(activeTelemetry)
  );
  const visiblePanes = parseParamList(
    searchParams.get('panes'),
    workspacePaneKeys,
    [...workspacePaneKeys]
  );
  const visibleMarkers = useMemo(
    () =>
      workspaceMarkers.filter((marker) => {
        switch (markerFilter) {
          case 'LONG':
            return marker.side === 'LONG' && marker.category === 'ENTRY';
          case 'SHORT':
            return marker.side === 'SHORT' && marker.category === 'ENTRY';
          case 'EXITS':
            return marker.category === 'EXIT' || marker.category === 'FORCED';
          case 'FORCED':
            return marker.category === 'FORCED' || marker.isForced;
          default:
            return true;
        }
      }),
    [markerFilter, workspaceMarkers]
  );

  const explicitMarker = useMemo(
    () => findMarkerById(workspaceMarkers, selectedMarkerId),
    [selectedMarkerId, workspaceMarkers]
  );
  const tradeFromExplicitMarker = useMemo(
    () => findTradeByMarkerId(workspaceTrades, selectedMarkerId),
    [selectedMarkerId, workspaceTrades]
  );
  const selectedTrade =
    workspaceTrades.find((trade) => trade.id === selectedTradeId) ??
    tradeFromExplicitMarker ??
    workspaceTrades[0] ??
    null;
  const inspectorMarker =
    explicitMarker ??
    (selectedTrade ? findMarkerById(workspaceMarkers, selectedTrade.entryMarkerId) : null);
  const visibleSelectedMarker =
    visibleMarkers.find((marker) => marker.id === inspectorMarker?.id) ??
    visibleMarkers.find((marker) => marker.tradeId === selectedTrade?.id) ??
    visibleMarkers[0] ??
    null;
  const activeMarkerIndex = visibleSelectedMarker
    ? visibleMarkers.findIndex((marker) => marker.id === visibleSelectedMarker.id)
    : -1;
  const focusTimestamp = deriveWorkspaceFocusTime(
    inspectorMarker ?? visibleSelectedMarker,
    selectedTrade
  );

  const selectTrade = (tradeId: string, preferredMarkerId?: string) => {
    const trade = workspaceTrades.find((entry) => entry.id === tradeId) ?? null;
    if (!trade) {
      return;
    }

    updateWorkspaceParams((params) => {
      params.set('trade', trade.id);
      params.set('marker', preferredMarkerId ?? trade.entryMarkerId);
    });
  };

  const stepMarker = (offset: number) => {
    if (visibleMarkers.length === 0) {
      return;
    }

    const nextIndex =
      activeMarkerIndex === -1
        ? 0
        : Math.min(Math.max(activeMarkerIndex + offset, 0), visibleMarkers.length - 1);
    const nextMarker = visibleMarkers[nextIndex];
    if (!nextMarker) {
      return;
    }

    updateWorkspaceParams((params) => {
      params.set('marker', nextMarker.id);
      params.set('trade', nextMarker.tradeId);
    });
  };

  return (
    <Stack spacing={2.5}>
      <Grid container spacing={2.5} alignItems="flex-start">
        <Grid size={{ xs: 12, xl: 8.25 }}>
          <SurfacePanel
            title="Chart workspace"
            description={`${summarizeMarkerFilter(markerFilter, visibleMarkers.length)} on ${activeTelemetry.symbol}. Click a marker or trade row to keep the chart and inspector in sync.`}
            actions={
              details.telemetry.length > 1 ? (
                <Select
                  size="small"
                  value={selectedTelemetrySymbol}
                  onChange={(event) => onTelemetrySelect(String(event.target.value))}
                >
                  {details.telemetry.map((series) => (
                    <MenuItem key={series.symbol} value={series.symbol}>
                      {series.symbol}
                    </MenuItem>
                  ))}
                </Select>
              ) : undefined
            }
            contentSx={{ gap: 1.5 }}
          >
            <LegendList
              items={[
                {
                  color: actionVisuals.BUY.color,
                  label: 'BUY',
                  detail: 'long entry',
                  shape: actionVisuals.BUY.legendShape,
                },
                {
                  color: actionVisuals.SELL.color,
                  label: 'SELL',
                  detail: 'long exit',
                  shape: actionVisuals.SELL.legendShape,
                },
                {
                  color: actionVisuals.SHORT.color,
                  label: 'SHORT',
                  detail: 'short entry',
                  shape: actionVisuals.SHORT.legendShape,
                },
                {
                  color: actionVisuals.COVER.color,
                  label: 'COVER',
                  detail: 'short exit',
                  shape: actionVisuals.COVER.legendShape,
                },
              ]}
            />

            <Stack spacing={1.25}>
              <Stack
                direction={{ xs: 'column', lg: 'row' }}
                spacing={1}
                alignItems={{ xs: 'stretch', lg: 'center' }}
              >
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={markerFilter}
                  onChange={(_, value: BacktestMarkerFilter | null) => {
                    if (value) {
                      updateWorkspaceParams((params) => {
                        params.set('filter', value);
                      });
                    }
                  }}
                >
                  <ToggleButton value="ALL">All</ToggleButton>
                  <ToggleButton value="LONG">Long</ToggleButton>
                  <ToggleButton value="SHORT">Short</ToggleButton>
                  <ToggleButton value="EXITS">Exits</ToggleButton>
                  <ToggleButton value="FORCED">Forced</ToggleButton>
                </ToggleButtonGroup>

                {overlayLegend.length > 0 ? (
                  <ToggleButtonGroup
                    size="small"
                    value={resolvedOverlayKeys}
                    onChange={(_, value: string[]) =>
                      updateWorkspaceParams((params) => {
                        params.set('overlays', value.length > 0 ? value.join(',') : 'none');
                      })
                    }
                  >
                    {overlayLegend.map((overlay) => (
                      <ToggleButton key={overlay.key} value={overlay.key}>
                        {overlay.label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                ) : null}

                <ToggleButtonGroup
                  size="small"
                  value={visiblePanes}
                  onChange={(_, value: string[]) =>
                    updateWorkspaceParams((params) => {
                      params.set('panes', value.length > 0 ? value.join(',') : 'none');
                    })
                  }
                >
                  <ToggleButton value="exposure">Exposure pane</ToggleButton>
                  <ToggleButton value="oscillator">Indicator pane</ToggleButton>
                </ToggleButtonGroup>
              </Stack>

              <BacktestWorkspaceChart
                series={activeTelemetry}
                markers={workspaceMarkers}
                selectedMarkerId={visibleSelectedMarker?.id ?? null}
                markerFilter={markerFilter}
                visibleOverlayKeys={resolvedOverlayKeys}
                showExposurePane={visiblePanes.includes('exposure')}
                showOscillatorPane={visiblePanes.includes('oscillator')}
                focusTimestamp={focusTimestamp}
                onMarkerSelect={(marker) => {
                  updateWorkspaceParams((params) => {
                    params.set('marker', marker.id);
                    params.set('trade', marker.tradeId);
                  });
                }}
              />
            </Stack>
          </SurfacePanel>
        </Grid>

        <Grid size={{ xs: 12, xl: 3.75 }}>
          <StickyInspectorPanel
            title="Inspector"
            description="Selection follows chart markers and trade rows so context stays in one place."
            actions={
              selectedTrade ? (
                <StatusPill
                  label={`${selectedTrade.side} trade`}
                  tone={selectedTrade.side === 'LONG' ? 'success' : 'error'}
                  variant="filled"
                />
              ) : undefined
            }
            mobileBehavior="drawer"
            mobileOpenLabel={selectedTrade ? 'Open trade detail' : 'Open inspector'}
            mobilePreview={
              selectedTrade ? (
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <StatusPill
                      label={`${selectedTrade.side} trade`}
                      tone={selectedTrade.side === 'LONG' ? 'success' : 'error'}
                      variant="filled"
                    />
                    <StatusPill label={selectedTrade.symbol} tone="info" />
                    <StatusPill
                      label={`PnL ${formatCurrency(selectedTrade.pnlValue, 2)}`}
                      tone={selectedTrade.pnlValue >= 0 ? 'success' : 'error'}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Open the inspector to review entry and exit timing, return, duration, and linked event context while keeping the chart unobstructed.
                  </Typography>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Select a chart marker or trade row, then open the inspector to review the linked evidence in a focused bottom sheet.
                </Typography>
              )
            }
          >
            {selectedTrade ? (
              <>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <StatusPill label={`Entry: ${selectedTrade.entryAction}`} tone="success" />
                  <StatusPill label={`Exit: ${selectedTrade.exitAction}`} tone="info" />
                  <StatusPill
                    label={
                      inspectorMarker?.category === 'FORCED'
                        ? 'Forced or flagged event'
                        : inspectorMarker?.category ?? 'Trade selection'
                    }
                    tone={inspectorMarker?.category === 'FORCED' ? 'warning' : 'default'}
                  />
                </Stack>

                <KeyValueGrid
                  items={[
                    { label: 'Symbol', value: selectedTrade.symbol },
                    { label: 'Entry time', value: formatDateTime(selectedTrade.entryTime) },
                    { label: 'Exit time', value: formatDateTime(selectedTrade.exitTime) },
                    { label: 'Duration', value: `${formatNumber(selectedTrade.durationMinutes)} min` },
                    { label: 'Entry price', value: formatCurrency(selectedTrade.entryPrice, 4) },
                    { label: 'Exit price', value: formatCurrency(selectedTrade.exitPrice, 4) },
                    { label: 'Quantity', value: formatNumber(selectedTrade.quantity, 6) },
                    {
                      label: 'PnL',
                      value: formatCurrency(selectedTrade.pnlValue, 2),
                      tone: selectedTrade.pnlValue >= 0 ? 'success' : 'error',
                    },
                    {
                      label: 'Return',
                      value: formatPercentage(selectedTrade.returnPct, 2),
                      tone: selectedTrade.returnPct >= 0 ? 'success' : 'error',
                    },
                    { label: 'Entry label', value: selectedTrade.entryLabel },
                    { label: 'Exit label', value: selectedTrade.exitLabel },
                  ]}
                />

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    onClick={() => stepMarker(-1)}
                    disabled={visibleMarkers.length === 0 || activeMarkerIndex <= 0}
                  >
                    Previous event
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => stepMarker(1)}
                    disabled={
                      visibleMarkers.length === 0 ||
                      activeMarkerIndex === -1 ||
                      activeMarkerIndex >= visibleMarkers.length - 1
                    }
                  >
                    Next event
                  </Button>
                </Stack>
              </>
            ) : (
              <EmptyState
                title="Select a trade or marker"
                description="Click a chart marker or a trade row to load entry, exit, and PnL details here."
                tone="info"
              />
            )}
          </StickyInspectorPanel>
        </Grid>
      </Grid>

      <SurfacePanel
        title="Trade review table"
        description="Rows stay linked to chart focus. Click one to jump the workspace to that trade's entry point."
      >
        {workspaceTrades.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                <TableCell>Side</TableCell>
                <TableCell>Entry</TableCell>
                <TableCell>Exit</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Entry price</TableCell>
                <TableCell align="right">Exit price</TableCell>
                <TableCell align="right">PnL</TableCell>
                <TableCell align="right">Return</TableCell>
              </TableRow>
            </TableHead>
                <TableBody>
              {workspaceTrades.map((trade, index) => (
                <TableRow
                  key={trade.id}
                  hover
                  selected={trade.id === selectedTrade?.id}
                  tabIndex={0}
                  onClick={() => selectTrade(trade.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      selectTrade(trade.id);
                    }

                    if (event.key === 'ArrowDown') {
                      event.preventDefault();
                      const nextTrade = workspaceTrades[Math.min(index + 1, workspaceTrades.length - 1)];
                      if (nextTrade) {
                        selectTrade(nextTrade.id);
                      }
                    }

                    if (event.key === 'ArrowUp') {
                      event.preventDefault();
                      const previousTrade = workspaceTrades[Math.max(index - 1, 0)];
                      if (previousTrade) {
                        selectTrade(previousTrade.id);
                      }
                    }
                  }}
                  sx={{
                    cursor: 'pointer',
                    '&:focus-visible': {
                      outline: (theme) => `2px solid ${theme.palette.primary.main}`,
                      outlineOffset: '-2px',
                    },
                  }}
                >
                  <TableCell>{trade.symbol}</TableCell>
                  <TableCell>
                    <StatusPill
                      label={trade.side}
                      tone={trade.side === 'LONG' ? 'success' : 'error'}
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>{formatDateTime(trade.entryTime)}</TableCell>
                  <TableCell>{formatDateTime(trade.exitTime)}</TableCell>
                  <TableCell align="right">
                    <NumericText variant="body2">
                      {formatNumber(trade.quantity, 6)}
                    </NumericText>
                  </TableCell>
                  <TableCell align="right">
                    <NumericText variant="body2">
                      {formatCurrency(trade.entryPrice, 4)}
                    </NumericText>
                  </TableCell>
                  <TableCell align="right">
                    <NumericText variant="body2">
                      {formatCurrency(trade.exitPrice, 4)}
                    </NumericText>
                  </TableCell>
                  <TableCell align="right">
                    <NumericText
                      variant="body2"
                      tone={trade.pnlValue >= 0 ? 'success' : 'error'}
                    >
                      {formatCurrency(trade.pnlValue, 2)}
                    </NumericText>
                  </TableCell>
                  <TableCell align="right">
                    <NumericText
                      variant="body2"
                      tone={trade.returnPct >= 0 ? 'success' : 'error'}
                    >
                      {formatPercentage(trade.returnPct, 2)}
                    </NumericText>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="No trade windows for this symbol"
            description="Switch the symbol or keep the analytics below for summary review."
            tone="info"
          />
        )}
      </SurfacePanel>
    </Stack>
  );
}

export function BacktestResults({
  details,
  transportLabel = 'Fallback polling',
  lastLiveEventAt = null,
  transportError = null,
  onDelete,
  deleteDisabled = false,
  onReplay,
  onFocusHistory,
}: BacktestResultsProps) {
  const exportRef = useRef<HTMLDivElement | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const equityCurve = useMemo(() => createEquityCurve(details), [details]);
  const drawdownCurve = useMemo(() => createDrawdownCurve(equityCurve), [equityCurve]);
  const monthlyReturns = useMemo(() => createMonthlyReturns(equityCurve), [equityCurve]);
  const tradeDistribution = useMemo(() => createTradeDistribution(details), [details]);
  const hasCompleteProvenance = Boolean(
    details.datasetId &&
      details.datasetChecksumSha256 &&
      details.datasetSchemaVersion &&
      details.datasetUploadedAt
  );
  const lastUpdateLabel = details.lastProgressAt
    ? formatDistanceToNow(new Date(details.lastProgressAt))
    : 'No progress updates yet';
  const preferredTelemetrySymbol = getPreferredTelemetrySymbol(details.symbol, details.telemetry);
  const requestedTelemetrySymbol = searchParams.get('symbol');
  const activeTelemetry =
    details.telemetry.find((series) => series.symbol === requestedTelemetrySymbol) ??
    details.telemetry.find((series) => series.symbol === preferredTelemetrySymbol) ??
    details.telemetry[0] ??
    null;

  const exportPdf = async () => {
    if (!hasCompleteProvenance) {
      setFeedback(
        'Report export is blocked until dataset checksum, schema version, and upload timestamp are available.'
      );
      return;
    }

    setFeedback(null);
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFontSize(14);
    doc.text(`Backtest ${details.id}`, 10, 12);
    doc.setFontSize(11);
    doc.text(`Experiment: ${details.experimentName}`, 10, 20);
    doc.text(`Algorithm: ${details.strategyId}`, 10, 26);
    doc.text(`Dataset: ${details.datasetName ?? '-'} (#${details.datasetId ?? 'n/a'})`, 10, 32);
    doc.text(`Schema: ${details.datasetSchemaVersion}`, 10, 38);
    doc.text(`Checksum: ${details.datasetChecksumSha256}`, 10, 44);
    doc.text(`Uploaded: ${formatDateTime(details.datasetUploadedAt ?? '')}`, 10, 50);
    doc.text(`Validation: ${details.validationStatus}`, 10, 56);
    doc.text(`Fees/Slippage: ${details.feesBps} bps / ${details.slippageBps} bps`, 10, 62);
    doc.text(
      `Sharpe: ${details.sharpeRatio.toFixed(2)} | Profit Factor: ${details.profitFactor.toFixed(2)}`,
      10,
      68
    );
    doc.text(
      `Win Rate: ${details.winRate.toFixed(2)}% | Max DD: ${details.maxDrawdown.toFixed(2)}%`,
      10,
      74
    );

    if (exportRef.current) {
      const dataUrl = await toPng(exportRef.current, { pixelRatio: 1.3, cacheBust: true });
      doc.addImage(dataUrl, 'PNG', 10, 82, 190, 114);
    }

    doc.save(`backtest_${details.id}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const copyShareableLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setFeedback('Shareable run link copied to clipboard.');
    } catch {
      setFeedback('Unable to copy the shareable run link from this browser context.');
    }
  };

  return (
    <Stack spacing={2.5}>
      <RouteActionBar
        sticky
        title={`Run #${details.id} research workspace`}
        description="Review entries, exits, overlays, and trade evidence in one flow before moving to compare or replay actions."
        actions={
          <>
            {onReplay ? (
              <Button variant="outlined" startIcon={<ReplayIcon />} onClick={onReplay}>
                Replay
              </Button>
            ) : null}
            {onFocusHistory ? (
              <Button
                variant="outlined"
                startIcon={<TableRowsIcon />}
                onClick={onFocusHistory}
              >
                Compare in history
              </Button>
            ) : null}
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={() => void copyShareableLink()}
            >
              Copy link
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => void exportPdf()}
              disabled={!hasCompleteProvenance}
            >
              Export PDF
            </Button>
            {onDelete ? (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineIcon />}
                onClick={onDelete}
                disabled={deleteDisabled}
              >
                Delete
              </Button>
            ) : null}
          </>
        }
        meta={
          <>
            <StatusPill
              label={`Validation: ${details.validationStatus}`}
              tone={validationTone(details.validationStatus)}
              variant="filled"
            />
            <StatusPill label={`Status: ${details.executionStatus}`} tone="info" />
            <StatusPill
              label={`Market: ${formatBacktestMarketLabel(details.symbol)} (${details.timeframe})`}
            />
            <StatusPill
              label={`Transport: ${transportLabel}`}
              tone={transportError ? 'warning' : 'success'}
            />
            <StatusPill
              label={`Last pushed event: ${formatLiveEventLabel(lastLiveEventAt)}`}
              tone={transportError ? 'warning' : 'default'}
            />
          </>
        }
      />

      {feedback ? (
        <Alert
          severity={feedback.toLowerCase().includes('unable') ? 'warning' : 'success'}
          onClose={() => setFeedback(null)}
        >
          {feedback}
        </Alert>
      ) : null}

      {activeTelemetry ? (
        <BacktestResearchWorkspace
          key={activeTelemetry.symbol}
          details={details}
          activeTelemetry={activeTelemetry}
          selectedTelemetrySymbol={activeTelemetry.symbol}
          onTelemetrySelect={(symbol) => {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.set('symbol', symbol);
            nextParams.delete('trade');
            nextParams.delete('marker');
            setSearchParams(nextParams, { replace: true });
          }}
        />
      ) : (
        <EmptyState
          title="Telemetry was not persisted for this run"
          description="Price-action review is unavailable, so use the analytics below for evidence review."
          tone="info"
        />
      )}

      <Box ref={exportRef}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <MetricCard
              label="Sharpe ratio"
              value={details.sharpeRatio.toFixed(2)}
              detail="Risk-adjusted return under the current cost model."
              tone="info"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <MetricCard
              label="Profit factor"
              value={details.profitFactor.toFixed(2)}
              detail="Gross profits divided by gross losses."
              tone={details.profitFactor >= 1 ? 'success' : 'warning'}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <MetricCard
              label="Win rate"
              value={`${details.winRate.toFixed(2)}%`}
              detail={`${details.totalTrades} recorded trades`}
              tone={details.winRate >= 50 ? 'success' : 'warning'}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <MetricCard
              label="Final balance"
              value={details.finalBalance.toFixed(2)}
              detail={`Initial balance ${details.initialBalance.toFixed(2)}`}
              tone={details.finalBalance >= details.initialBalance ? 'success' : 'error'}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <SurfacePanel
              title="Execution telemetry"
              description="Runtime progress and transport context stay visible here so chart review never loses execution status."
            >
              <Stack spacing={0.75}>
                <Typography variant="body2" color="text.secondary">
                  Status: {details.executionStatus} | Stage: {details.executionStage} | Progress:{' '}
                  {details.progressPercent}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current data date:{' '}
                  {details.currentDataTimestamp
                    ? formatDateTime(details.currentDataTimestamp)
                    : 'Waiting for first candle'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Candles processed: {formatNumber(details.processedCandles)} /{' '}
                  {formatNumber(details.totalCandles)} | Remaining{' '}
                  {Math.max(0, 100 - details.progressPercent)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Started: {details.startedAt ? formatDateTime(details.startedAt) : 'Queued only'} |
                  Last update: {lastUpdateLabel}
                  {details.completedAt
                    ? ` | Completed: ${formatDateTime(details.completedAt)}`
                    : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Transport: {transportLabel} | Last pushed event:{' '}
                  {formatLiveEventLabel(lastLiveEventAt)}
                  {transportError ? ` | Stream status: ${transportError}` : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {details.statusMessage ??
                    'No backend status message was recorded for this run.'}
                </Typography>
                {details.errorMessage ? <Alert severity="error">{details.errorMessage}</Alert> : null}
              </Stack>
            </SurfacePanel>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <SurfacePanel
              title="Reproducibility"
              description="Dataset identity, schema, and archive state stay explicit so this run remains evidence-backed."
            >
              {hasCompleteProvenance ? (
                <Stack spacing={0.75}>
                  <Typography variant="body2" color="text.secondary">
                    Dataset #{details.datasetId} | {details.datasetName ?? '-'} | Schema{' '}
                    {details.datasetSchemaVersion}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Experiment key: {details.experimentKey}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Checksum: {details.datasetChecksumSha256}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uploaded: {formatDateTime(details.datasetUploadedAt ?? '')}
                    {details.datasetArchived
                      ? ' | Archived from active catalog'
                      : ' | Active in dataset catalog'}
                  </Typography>
                </Stack>
              ) : (
                <Alert severity="warning">
                  This run is missing full dataset provenance. Charts remain visible, but report
                  export is intentionally blocked.
                </Alert>
              )}
            </SurfacePanel>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <EquityCurve points={equityCurve} />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <DrawdownChart points={drawdownCurve} maxDrawdownLimitPct={25} />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MonthlyReturnsHeatmap data={monthlyReturns} />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <TradeDistributionHistogram bins={tradeDistribution} />
          </Grid>
        </Grid>
      </Box>
    </Stack>
  );
}
