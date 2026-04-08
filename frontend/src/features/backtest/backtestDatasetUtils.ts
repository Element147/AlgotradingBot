export const parseDatasetSymbols = (symbolsCsv: string): string[] =>
  symbolsCsv
    .split(',')
    .map((symbol) => symbol.trim())
    .filter((symbol) => symbol.length > 0);
