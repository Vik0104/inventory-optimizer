import { Config, InputRow } from '@/types';

// Use global object to ensure data persists across API calls
declare global {
  var __inventoryOptimizerStore: {
    config: Config;
    data: InputRow[];
  } | undefined;
}

// Initialize global store if it doesn't exist
if (!global.__inventoryOptimizerStore) {
  global.__inventoryOptimizerStore = {
    config: {
      volumeUnits: 'unit',
      currency: 'EUR',
      otherMeasure: 'kg',
      inputTimeUnit: 'day',
      forecastingPeriod: 'monthly',
      reorderQuantityApproach: 'EOQ'
    },
    data: []
  };
}

export const globalStore = {
  getConfig(): Config {
    return { ...global.__inventoryOptimizerStore!.config };
  },

  setConfig(config: Config): void {
    global.__inventoryOptimizerStore!.config = { ...config };
  },

  getData(): InputRow[] {
    return [...global.__inventoryOptimizerStore!.data];
  },

  setData(data: InputRow[]): void {
    global.__inventoryOptimizerStore!.data = [...data];
  },

  hasData(): boolean {
    return global.__inventoryOptimizerStore!.data.length > 0;
  },

  clearData(): void {
    global.__inventoryOptimizerStore!.data = [];
  },

  getStatus() {
    return {
      hasData: this.hasData(),
      itemCount: global.__inventoryOptimizerStore!.data.length,
      lastUpdated: new Date().toISOString()
    };
  }
};