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
    key: 'BUY_AND_HOLD',
    title: 'Buy and Hold Baseline',
    shortDescription:
      'Reference benchmark: enter once at start and hold position to end of test window.',
    entryRule: 'Single entry at beginning of selected period.',
    exitRule: 'Single exit at end of selected period.',
    bestFor: 'Baseline comparison against active strategy logic.',
    riskNotes: 'No active reaction to volatility, drawdown, or changing market regime.',
  },
];

const normalize = (value: string): string => value.trim().replace(/-/g, '_').toUpperCase();

export const getStrategyProfile = (strategyType: string): StrategyProfile | null => {
  const normalizedType = normalize(strategyType);
  return PROFILES.find((profile) => profile.key === normalizedType) ?? null;
};

export const getAllStrategyProfiles = (): StrategyProfile[] => PROFILES;
