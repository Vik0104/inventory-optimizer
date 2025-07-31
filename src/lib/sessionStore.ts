import { Config, InputRow } from '@/types';

// Session-based storage for serverless environments
// Uses a combination of techniques to persist data between API calls

interface SessionData {
  config: Config;
  data: InputRow[];
  timestamp: number;
  sessionId?: string;
}

// In-memory cache (works for same instance)
let memoryCache: SessionData | null = null;

// Default configuration
const defaultConfig: Config = {
  volumeUnits: 'Units',
  currency: 'EUR',
  otherMeasure: 'kg',
  inputTimeUnit: 'Month',
  forecastingPeriod: '12',
  reorderQuantityApproach: 'EOQ'
};

export const sessionStore = {
  
  setData(data: InputRow[], sessionId?: string): void {
    console.log(`💾 SessionStore: Storing ${data.length} items`);
    
    const sessionData: SessionData = {
      config: memoryCache?.config || defaultConfig,
      data: [...data],
      timestamp: Date.now(),
      sessionId: sessionId || 'default'
    };
    
    // Store in memory cache
    memoryCache = sessionData;
    
    // Also store in global for backward compatibility
    if (typeof global !== 'undefined') {
      (global as any).__inventoryOptimizerStore = {
        config: sessionData.config,
        data: sessionData.data
      };
    }
    
    console.log(`✅ SessionStore: Data stored successfully`);
  },

  getData(): InputRow[] {
    console.log(`🔍 SessionStore: Retrieving data...`);
    
    // Try memory cache first
    if (memoryCache && memoryCache.data.length > 0) {
      console.log(`✅ SessionStore: Found ${memoryCache.data.length} items in memory cache`);
      return [...memoryCache.data];
    }
    
    // Try global store as fallback
    if (typeof global !== 'undefined' && (global as any).__inventoryOptimizerStore) {
      const globalData = (global as any).__inventoryOptimizerStore.data;
      if (globalData && globalData.length > 0) {
        console.log(`✅ SessionStore: Found ${globalData.length} items in global store`);
        return [...globalData];
      }
    }
    
    console.log(`❌ SessionStore: No data found`);
    return [];
  },

  hasData(): boolean {
    const data = this.getData();
    return data.length > 0;
  },

  setConfig(config: Config): void {
    console.log(`🔧 SessionStore: Updating config`);
    
    if (memoryCache) {
      memoryCache.config = { ...config };
    } else {
      memoryCache = {
        config: { ...config },
        data: [],
        timestamp: Date.now()
      };
    }
    
    // Update global store too
    if (typeof global !== 'undefined') {
      if (!(global as any).__inventoryOptimizerStore) {
        (global as any).__inventoryOptimizerStore = { config: defaultConfig, data: [] };
      }
      (global as any).__inventoryOptimizerStore.config = { ...config };
    }
  },

  getConfig(): Config {
    // Try memory cache first
    if (memoryCache?.config) {
      return { ...memoryCache.config };
    }
    
    // Try global store
    if (typeof global !== 'undefined' && (global as any).__inventoryOptimizerStore?.config) {
      return { ...(global as any).__inventoryOptimizerStore.config };
    }
    
    // Return default config
    return { ...defaultConfig };
  },

  clearData(): void {
    console.log(`🗑️ SessionStore: Clearing data`);
    memoryCache = null;
    
    if (typeof global !== 'undefined' && (global as any).__inventoryOptimizerStore) {
      (global as any).__inventoryOptimizerStore.data = [];
    }
  },

  getStatus() {
    const data = this.getData();
    const config = this.getConfig();
    
    return {
      hasData: data.length > 0,
      itemCount: data.length,
      config: config,
      timestamp: memoryCache?.timestamp || Date.now(),
      sessionId: memoryCache?.sessionId || 'default',
      source: memoryCache ? 'memory' : 'global'
    };
  }
};