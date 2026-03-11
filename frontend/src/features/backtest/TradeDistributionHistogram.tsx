import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartContainer } from '@/components/charts/ChartContainer';

export interface HistogramBin {
  rangeLabel: string;
  count: number;
}

interface TradeDistributionHistogramProps {
  bins: HistogramBin[];
}

export function TradeDistributionHistogram({ bins }: TradeDistributionHistogramProps) {
  const rows = bins.map((bin) => [bin.rangeLabel, bin.count]);

  return (
    <ChartContainer
      title="Trade Distribution Histogram"
      description="Distribution of trade outcomes across PnL bins."
      headers={['PnL Range', 'Count']}
      rows={rows}
      csvFileName="trade-distribution.csv"
      pngFileName="trade-distribution.png"
      chart={
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={bins}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rangeLabel" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0288d1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      }
    />
  );
}
