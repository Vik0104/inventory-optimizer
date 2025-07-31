import { InputRow, CalculationResult, Config } from '@/types';
import { lookupSafetyFactor, findOptimalK } from './safetyFactorTable';

export interface DemandStatistics {
  averageDemand: number;
  standardDeviation: number;
  totalDemand: number;
  demandVariability: number;
}

export interface StockCalculations {
  cycleStock: number;
  safetyStock: number;
  targetSafetyStock: number;
  inTransitStock: number;
  totalTargetStock: number;
  totalActualStock: number;
  savingsPotential: number;
  serviceLevel: number;
  reorderPoint: number;
  economicOrderQuantity: number;
}

export class InventoryCalculator {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  // Calculate demand statistics from historical data
  calculateDemandStatistics(demandData: number[]): DemandStatistics {
    const validDemand = demandData.filter(d => !isNaN(d) && d >= 0);
    
    if (validDemand.length === 0) {
      return {
        averageDemand: 0,
        standardDeviation: 0,
        totalDemand: 0,
        demandVariability: 0
      };
    }

    const totalDemand = validDemand.reduce((sum, d) => sum + d, 0);
    const averageDemand = totalDemand / validDemand.length;
    
    // Calculate standard deviation
    const variance = validDemand.reduce((sum, d) => sum + Math.pow(d - averageDemand, 2), 0) / validDemand.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Demand variability (coefficient of variation)
    const demandVariability = averageDemand > 0 ? standardDeviation / averageDemand : 0;

    return {
      averageDemand,
      standardDeviation,
      totalDemand,
      demandVariability
    };
  }

  // Calculate Economic Order Quantity (EOQ)
  calculateEOQ(
    annualDemand: number,
    orderCost: number,
    holdingCostRate: number,
    unitCost: number
  ): number {
    if (annualDemand <= 0 || orderCost <= 0 || holdingCostRate <= 0 || unitCost <= 0) {
      return 0;
    }

    const holdingCost = unitCost * holdingCostRate;
    return Math.sqrt((2 * annualDemand * orderCost) / holdingCost);
  }

  // Calculate safety stock using safety factor table
  calculateSafetyStock(
    demandStats: DemandStatistics,
    leadTime: number,
    serviceLevel: number,
    orderQuantity: number
  ): { safetyStock: number; k: number } {
    if (demandStats.standardDeviation === 0 || leadTime <= 0) {
      return { safetyStock: 0, k: 0 };
    }

    // Calculate lead time demand variability
    const leadTimeDemandStdDev = demandStats.standardDeviation * Math.sqrt(leadTime);
    
    // Find k factor for desired service level
    const k = findOptimalK(serviceLevel);
    
    // Calculate q/σ ratio for safety factor lookup
    const qOverSigma = orderQuantity / leadTimeDemandStdDev;
    
    // Lookup safety factor
    const safetyFactor = lookupSafetyFactor(k, qOverSigma);
    
    // Calculate safety stock
    const safetyStock = safetyFactor * leadTimeDemandStdDev;

    return { safetyStock, k };
  }

  // Calculate cycle stock (average inventory during order cycle)
  calculateCycleStock(orderQuantity: number): number {
    return orderQuantity / 2;
  }

  // Calculate in-transit stock
  calculateInTransitStock(
    averageDemand: number,
    leadTime: number,
    includeTransit: boolean
  ): number {
    if (!includeTransit || leadTime <= 0) {
      return 0;
    }
    return averageDemand * leadTime;
  }

  // Calculate reorder point
  calculateReorderPoint(
    averageDemand: number,
    leadTime: number,
    safetyStock: number
  ): number {
    return (averageDemand * leadTime) + safetyStock;
  }

  // Main calculation function for a single item
  calculateItem(item: InputRow): CalculationResult & StockCalculations {
    try {
      // Calculate demand statistics
      const demandStats = this.calculateDemandStatistics(item.demandData);
      
      // Convert to annual demand (assuming monthly data)
      const periodsPerYear = this.config.forecastingPeriod === 'monthly' ? 12 : 
                            this.config.forecastingPeriod === 'weekly' ? 52 : 365;
      const annualDemand = demandStats.averageDemand * periodsPerYear;

    // Get item parameters with defaults
    const unitCost = item.unitCost || 10;
    const leadTime = item.leadTime || 30; // days
    const serviceLevel = item.serviceLevel || 0.95;
    const orderCost = item.orderCost || 100;
    const holdingCostRate = item.holdingCostRate || 0.25;

    // Calculate EOQ or use direct input
    let orderQuantity: number;
    if (this.config.reorderQuantityApproach === 'EOQ') {
      orderQuantity = this.calculateEOQ(annualDemand, orderCost, holdingCostRate, unitCost);
    } else {
      orderQuantity = item.orderQuantity || this.calculateEOQ(annualDemand, orderCost, holdingCostRate, unitCost);
    }

    // Calculate cycle stock
    const cycleStock = this.calculateCycleStock(orderQuantity);

    // Calculate safety stock
    const { safetyStock, k } = this.calculateSafetyStock(
      demandStats,
      leadTime,
      serviceLevel,
      orderQuantity
    );

    // Calculate optimal safety stock (target)
    const targetServiceLevel = 0.95; // Standard target
    const { safetyStock: targetSafetyStock } = this.calculateSafetyStock(
      demandStats,
      leadTime,
      targetServiceLevel,
      orderQuantity
    );

    // Calculate in-transit stock
    const inTransitStock = this.calculateInTransitStock(
      demandStats.averageDemand,
      leadTime,
      item.transitIncluded === 'yes'
    );

    // Calculate reorder point
    const reorderPoint = this.calculateReorderPoint(
      demandStats.averageDemand,
      leadTime,
      safetyStock
    );

    // Calculate total stocks
    const totalTargetStock = cycleStock + targetSafetyStock + inTransitStock;
    const totalActualStock = cycleStock + safetyStock + inTransitStock;

    // Calculate savings potential (current vs optimized)
    const currentInventoryValue = item.currentStock || totalActualStock;
    const savingsPotential = Math.max(0, (currentInventoryValue - totalTargetStock) * unitCost);

      return {
        id: item.id,
        cycleStock,
        safetyStock,
        targetSafetyStock,
        inTransit: inTransitStock,
        inTransitStock,
        targetStock: totalTargetStock,
        totalTargetStock,
        actualStock: totalActualStock,
        totalActualStock,
        savingsPotential,
        serviceLevel,
        reorderPoint,
        economicOrderQuantity: orderQuantity
      };
      
    } catch (error) {
      console.error(`Error calculating item ${item.id}:`, error);
      // Return a default result to prevent calculation chain from breaking
      return {
        id: item.id,
        cycleStock: 0,
        safetyStock: 0,
        targetSafetyStock: 0,
        inTransit: 0,
        inTransitStock: 0,
        targetStock: 0,
        totalTargetStock: 0,
        actualStock: 0,
        totalActualStock: 0,
        savingsPotential: 0,
        serviceLevel: 0.95,
        reorderPoint: 0,
        economicOrderQuantity: 0
      };
    }
  }

  // Calculate all items
  calculateAll(items: InputRow[]): CalculationResult[] {
    return items.map(item => this.calculateItem(item));
  }

  // Calculate summary statistics
  calculateSummary(results: CalculationResult[]): {
    totalItems: number;
    totalSavingsPotential: number;
    averageServiceLevel: number;
    totalTargetStock: number;
    totalActualStock: number;
    inventoryTurnover: number;
  } {
    const totalItems = results.length;
    const totalSavingsPotential = results.reduce((sum, r) => sum + r.savingsPotential, 0);
    const averageServiceLevel = results.reduce((sum, r) => sum + r.serviceLevel, 0) / totalItems;
    const totalTargetStock = results.reduce((sum, r) => sum + r.targetStock, 0);
    const totalActualStock = results.reduce((sum, r) => sum + r.actualStock, 0);
    
    // Calculate inventory turnover (assuming annual demand)
    const totalAnnualDemand = results.reduce((sum, r) => sum + (r.economicOrderQuantity * 12), 0);
    const inventoryTurnover = totalActualStock > 0 ? totalAnnualDemand / totalActualStock : 0;

    return {
      totalItems,
      totalSavingsPotential,
      averageServiceLevel,
      totalTargetStock,
      totalActualStock,
      inventoryTurnover
    };
  }
}