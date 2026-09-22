type Metric = {
  name: string;
  count: number;
  lastUpdated: string;
};

const metrics: Record<string, Metric> = {};

export function increment(name: string): void {
  if (!metrics[name]) {
    metrics[name] = { name, count: 0, lastUpdated: new Date().toISOString() };
  }
  metrics[name].count++;
  metrics[name].lastUpdated = new Date().toISOString();
}

export function getAllMetrics(): Metric[] {
  return Object.values(metrics);
}

export function resetMetrics(): void {
  Object.keys(metrics).forEach((k) => delete metrics[k]);
}