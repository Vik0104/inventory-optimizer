export interface Config {
  volumeUnits: string;
  currency: string;
  otherMeasure: string;
  inputTimeUnit: string;
  forecastingPeriod: string;
  reorderQuantityApproach: 'EOQ' | 'Direct input';
}

export interface InputRow {
  id: string;
  description: string;
  product: string;
  warehouse: string;
  category1?: string;
  category2?: string;
  category3?: string;
  replenishmentStrategy: string;
  transitIncluded: 'yes' | 'no';
  demandData: number[];
  historicInventory: number[];
  unitCost?: number;
  leadTime?: number;
  serviceLevel?: number;
  orderCost?: number;
  holdingCostRate?: number;
  orderQuantity?: number;
  currentStock?: number;
  [key: string]: any;
}

export interface SafetyFactorEntry {
  k: number;
  values: number[];
}

export interface CalculationResult {
  id: string;
  cycleStock: number;
  safetyStock: number;
  inTransit: number;
  inTransitStock?: number;
  targetStock: number;
  totalTargetStock?: number;
  actualStock: number;
  totalActualStock?: number;
  savingsPotential: number;
  serviceLevel: number;
  reorderPoint: number;
  economicOrderQuantity: number;
}

export interface PivotData {
  warehouse: string;
  totalActualStock: number;
  totalPotential: number;
  totalTargetStock: number;
  actualSafetyStock: number;
  targetSafetyStock: number;
}

export interface SummaryData {
  yearlyDemand: number;
  totalSavings: number;
  warehouseData: PivotData[];
}