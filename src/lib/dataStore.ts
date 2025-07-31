import { Config, InputRow } from '@/types';

// Simple in-memory data store for development
// In production, this should be replaced with a proper database

class DataStore {
  private config: Config = {
    volumeUnits: 'unit',
    currency: 'EUR',
    otherMeasure: 'kg',
    inputTimeUnit: 'day',
    forecastingPeriod: 'monthly',
    reorderQuantityApproach: 'EOQ'
  };

  private uploadedData: InputRow[] = [];

  // Config methods
  getConfig(): Config {
    return { ...this.config };
  }

  setConfig(newConfig: Config): void {
    this.config = { ...newConfig };
  }

  // Data methods
  getData(): InputRow[] {
    return [...this.uploadedData];
  }

  setData(data: InputRow[]): void {
    this.uploadedData = [...data];
  }

  hasData(): boolean {
    return this.uploadedData.length > 0;
  }

  clearData(): void {
    this.uploadedData = [];
  }

  // Get summary info
  getDataSummary() {
    const warehouseSet = new Set(this.uploadedData.map(item => item.warehouse));
    return {
      hasData: this.hasData(),
      itemCount: this.uploadedData.length,
      warehouses: Array.from(warehouseSet),
      lastUpdated: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const dataStore = new DataStore();