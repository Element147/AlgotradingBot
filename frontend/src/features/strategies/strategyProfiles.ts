export interface StrategyProfile {
  key: string;
  title: string;
  shortDescription: string;
  entryRule: string;
  exitRule: string;
  bestFor: string;
  riskNotes: string;
}

const PROFILES: StrategyProfile[] = [
  {
    key: 'BUY_AND_HOLD',
    title: 'Buy and Hold Baseline',
    shortDescription:
      'Reference benchmark that enters once and stays invested through the selected test window.',
    entryRule: 'Single entry after the warm-up window begins.',
    exitRule: 'Single exit at the end of the selected period.',
    bestFor: 'Baseline comparison against active strategy logic.',
    riskNotes: 'No active reaction to volatility, drawdown, or changing market regime.',
  },
  {
    key: 'DUAL_MOMENTUM_ROTATION',
    title: 'Dual Momentum Rotation',
    shortDescription:
      'Ranks the strongest assets in the dataset and rotates into the leader only when absolute momentum stays positive.',
    entryRule: 'Enter the top-ranked asset when it leads on 63/126-bar momentum and passes the absolute filter.',
    exitRule: 'Rotate when leadership changes, or move to cash when absolute momentum turns negative.',
    bestFor: 'Small-account, lower-turnover trend allocation across a multi-symbol dataset.',
    riskNotes: 'Can suffer during sharp momentum crashes and fast trend reversals.',
  },
  {
    key: 'VOLATILITY_MANAGED_DONCHIAN_BREAKOUT',
    title: 'Volatility-Managed Donchian Breakout',
    shortDescription:
      'Follows strong breakouts above a rolling high while reducing size when realized volatility rises.',
    entryRule: 'Enter after a 55-bar breakout above the long-term trend filter.',
    exitRule: 'Exit on 20-bar breakdown, ATR stop failure, or regime deterioration.',
    bestFor: 'Directional trend phases with persistent continuation.',
    riskNotes: 'Can take repeated small losses in sideways markets.',
  },
  {
    key: 'TREND_PULLBACK_CONTINUATION',
    title: 'Trend Pullback Continuation',
    shortDescription:
      'Waits for a pullback inside an uptrend and enters once price resumes the higher-timeframe move.',
    entryRule: 'Enter after a bullish pullback with oversold RSI or EMA touch that reclaims the fast EMA.',
    exitRule: 'Exit when the continuation fails, the trend filter breaks, or ATR stop is breached.',
    bestFor: 'Trending markets where cleaner entries matter more than maximum trade count.',
    riskNotes: 'Repeated failed pullbacks can cluster near trend exhaustion.',
  },
  {
    key: 'REGIME_FILTERED_MEAN_REVERSION',
    title: 'Regime-Filtered Mean Reversion',
    shortDescription:
      'Buys oversold snapbacks only when trend strength is muted and the market is still in a safer regime.',
    entryRule: 'Enter after an oversold lower-band close snaps back up while ADX stays in range territory.',
    exitRule: 'Exit at the mean, on a fixed time stop, or after ATR stop failure.',
    bestFor: 'Sideways or choppy environments where trend systems tend to whipsaw.',
    riskNotes: 'Performs poorly if a real breakdown is mistaken for a range-bound dip.',
  },
  {
    key: 'TREND_FIRST_ADAPTIVE_ENSEMBLE',
    title: 'Trend-First Adaptive Ensemble',
    shortDescription:
      'Routes capital to trend or mean-reversion logic depending on regime while still choosing the strongest asset in the dataset.',
    entryRule: 'Select the strongest symbol, then activate breakout/pullback logic in trend or mean reversion in range.',
    exitRule: 'Exit when regime routing invalidates the active layer or a stronger asset takes over.',
    bestFor: 'Higher-potential multi-signal research once standalone strategies exist.',
    riskNotes: 'More complex and more vulnerable to false confidence if overfit.',
  },
  {
    key: 'SMA_CROSSOVER',
    title: 'SMA Crossover Trend Following',
    shortDescription:
      'Compares short and long moving averages and follows momentum after trend confirmation.',
    entryRule:
      'Enter when fast SMA crosses above slow SMA (or opposite for short-enabled variants).',
    exitRule:
      'Exit on opposite crossover or when portfolio/risk guardrails trigger.',
    bestFor: 'Directional trend phases with persistent momentum.',
    riskNotes: 'Can whipsaw and overtrade in choppy market with no clear trend.',
  },
  {
    key: 'BOLLINGER_BANDS',
    title: 'Bollinger Bands Mean Reversion',
    shortDescription:
      'Looks for short-term overreaction away from the average price band and expects a pullback.',
    entryRule:
      'Enter when price drops below lower Bollinger band and volatility supports a reversal setup.',
    exitRule:
      'Exit on move back to middle band, or when risk controls/circuit breaker are hit.',
    bestFor: 'Range-bound or sideways market with repeated rebounds.',
    riskNotes: 'Can perform poorly in strong one-direction trend where price keeps drifting away.',
  },
];

const normalize = (value: string): string => value.trim().replace(/-/g, '_').toUpperCase();

export const getStrategyProfile = (strategyType: string): StrategyProfile | null => {
  const normalizedType = normalize(strategyType);
  return PROFILES.find((profile) => profile.key === normalizedType) ?? null;
};

export const getAllStrategyProfiles = (): StrategyProfile[] => PROFILES;
