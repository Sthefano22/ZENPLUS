import { AnalyticsEventDTO } from './analytics.schema';

const processedEventIds = new Set<string>();

export class AnalyticsService {
  async ingestEvent(event: AnalyticsEventDTO) {
    if (processedEventIds.has(event.eventId)) {
      return { status: 'ignored' };
    }

    processedEventIds.add(event.eventId);

    console.log(`[Analytics Service] Event ingested successfully: ${event.name} (${event.eventId})`);

    return { status: 'success' };
  }

  async runIncrementalTransformation(batchDate: string) {
    console.log(`[Analytics Job] Running incremental transformation for date: ${batchDate}`);
  }
}