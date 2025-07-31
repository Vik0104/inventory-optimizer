// Safety Factor Table - replicates the SafetyFactorTable from Excel
// This table contains pre-calculated values for safety stock optimization
// E(k) - E(k+q/σ) values for different k and q/σ combinations

export interface SafetyFactorData {
  k: number;
  values: { [qOverSigma: string]: number };
}

// Generate safety factor table using normal distribution calculations
function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function normalCDF(x: number): number {
  // Approximation of the cumulative distribution function
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x) / Math.sqrt(2);
  
  // Abramowitz and Stegun approximation
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;
  
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  
  return 0.5 * (1.0 + sign * y);
}

function expectedShortfall(k: number): number {
  // E(k) = φ(k) - k * Φ(k) where φ is PDF and Φ is CDF
  return normalPDF(k) - k * (1 - normalCDF(k));
}

function expectedShortfallWithQ(k: number, qOverSigma: number): number {
  // E(k+q/σ) = φ(k+q/σ) - (k+q/σ) * Φ(k+q/σ)
  const kPlusQ = k + qOverSigma;
  return normalPDF(kPlusQ) - kPlusQ * (1 - normalCDF(kPlusQ));
}

// Pre-calculate safety factor table
export function generateSafetyFactorTable(): SafetyFactorData[] {
  const table: SafetyFactorData[] = [];
  
  // k values from 5 to 0 in decrements of 0.01 (like in Excel)
  const kValues: number[] = [];
  for (let k = 5.0; k >= 0; k -= 0.01) {
    kValues.push(Math.round(k * 100) / 100); // Round to 2 decimal places
  }
  
  // q/σ values from 3 to 0 in decrements of 0.01
  const qOverSigmaValues: number[] = [];
  for (let q = 3.0; q >= 0; q -= 0.01) {
    qOverSigmaValues.push(Math.round(q * 100) / 100);
  }
  
  kValues.forEach(k => {
    const values: { [qOverSigma: string]: number } = {};
    
    qOverSigmaValues.forEach(qOverSigma => {
      // Calculate E(k) - E(k+q/σ)
      const ekValue = expectedShortfall(k);
      const ekPlusQValue = expectedShortfallWithQ(k, qOverSigma);
      const difference = ekValue - ekPlusQValue;
      
      values[qOverSigma.toFixed(2)] = Math.max(0, difference); // Ensure non-negative
    });
    
    table.push({ k, values });
  });
  
  return table;
}

// Cached table for performance
let cachedSafetyFactorTable: SafetyFactorData[] | null = null;

export function getSafetyFactorTable(): SafetyFactorData[] {
  if (!cachedSafetyFactorTable) {
    cachedSafetyFactorTable = generateSafetyFactorTable();
  }
  return cachedSafetyFactorTable;
}

// Lookup function for safety factor
export function lookupSafetyFactor(k: number, qOverSigma: number): number {
  const table = getSafetyFactorTable();
  
  // Round inputs to nearest 0.01
  const roundedK = Math.round(k * 100) / 100;
  const roundedQOverSigma = Math.round(qOverSigma * 100) / 100;
  
  // Find the entry for k
  const kEntry = table.find(entry => Math.abs(entry.k - roundedK) < 0.005);
  
  if (!kEntry) {
    // If exact k not found, interpolate or use closest value
    const closestK = table.reduce((prev, curr) => 
      Math.abs(curr.k - roundedK) < Math.abs(prev.k - roundedK) ? curr : prev
    );
    return closestK.values[roundedQOverSigma.toFixed(2)] || 0;
  }
  
  return kEntry.values[roundedQOverSigma.toFixed(2)] || 0;
}

// Utility function to find optimal k for given service level
export function findOptimalK(serviceLevel: number): number {
  // Use inverse normal CDF approximation
  // This is an approximation - for exact values, use a proper inverse normal function
  
  if (serviceLevel >= 0.9999) return 4.0;
  if (serviceLevel <= 0.5) return 0.0;
  
  // Simple approximation using bisection method
  let low = 0;
  let high = 4;
  const tolerance = 0.001;
  
  while (high - low > tolerance) {
    const mid = (low + high) / 2;
    const cdf = normalCDF(mid);
    
    if (cdf < serviceLevel) {
      low = mid;
    } else {
      high = mid;
    }
  }
  
  return (low + high) / 2;
}