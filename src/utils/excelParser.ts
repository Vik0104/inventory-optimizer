import * as XLSX from 'xlsx';
import { InputRow } from '@/types';

export function parseExcelFile(file: ArrayBuffer): Promise<InputRow[]> {
  return new Promise((resolve, reject) => {
    try {
      const workbook = XLSX.read(file, { type: 'array' });
      
      // Find the Input sheet
      const inputSheetName = workbook.SheetNames.find(name => 
        name.toLowerCase().includes('input')
      );
      
      if (!inputSheetName) {
        reject(new Error(`Input sheet not found. Available sheets: ${workbook.SheetNames.join(', ')}`));
        return;
      }
      
      const worksheet = workbook.Sheets[inputSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: null,
        raw: false
      }) as any[][];
      
      // Skip header rows and process data - header is at row 3 (index 2), data starts at row 4 (index 3)
      const dataRows = jsonData.slice(3); // Skip first 3 rows to get to data
      
      const parsedData: InputRow[] = dataRows
        .filter(row => row && row[0]) // Filter out empty rows (check ID in column 0)
        .map((row, index) => {
          // Debug logging for first few rows (disabled)
          // if (index < 3) {
          //   console.log(`🔍 Row ${index + 1} length: ${row.length}, columns 28-32:`, row.slice(28, 33));
          // }
          
          // Based on Excel analysis, extract demand data from columns after the basic data
          // Look for 12 months of demand data starting around column 33 (AG)
          const demandData: number[] = [];
          for (let i = 32; i < 44; i++) { // 12 months of demand data
            const value = row[i];
            demandData.push(value ? parseFloat(value) || 0 : 0);
          }
          
          // Historic inventory data (if available)
          const historicInventory: number[] = [];
          for (let i = 44; i < Math.min(row.length, 60); i++) {
            const value = row[i];
            historicInventory.push(value ? parseFloat(value) || 0 : 0);
          }
          
          const item: InputRow = {
            id: row[0]?.toString() || `item-${index + 1}`,
            description: row[1]?.toString() || '',
            product: row[2]?.toString() || '',
            warehouse: row[3]?.toString() || '',
            category1: row[4]?.toString() || '',
            category2: row[5]?.toString() || '',
            category3: row[6]?.toString() || '',
            replenishmentStrategy: row[7]?.toString() || 'MTS',
            transitIncluded: (row[8]?.toString().toLowerCase() === 'yes' ? 'yes' : 'no') as 'yes' | 'no',
            demandData,
            historicInventory,
            // Map fields to correct Excel columns based on analysis
            leadTime: parseFloat(row[9]) || 30,  // Column J: Lead time (days)
            serviceLevel: (parseFloat(row[15]) || 95) / 100,  // Column P: Service level (percent) - convert to decimal
            unitCost: parseFloat(row[23]) || 10,  // Column X: Unit cost (EUR/unit)
            orderCost: parseFloat(row[25]) || 150,  // Column Z: Fixed cost per order (EUR)
            holdingCostRate: (parseFloat(row[26]) || 25) / 100,  // Column AA: Inventory carrying rate (percent) - convert to decimal
            currentStock: parseFloat((row[28] || '100').toString().replace(/,/g, '')) || 100,  // Column AC: Avg. actual inventory (units)
            orderQuantity: parseFloat(row[13]) || 0,  // Column N: Target reorder quantity
          };
          
          // if (index < 3) {
          //   console.log(`🎯 Parsed item ${index + 1}:`, {
          //     id: item.id,
          //     description: item.description,
          //     warehouse: item.warehouse,
          //     leadTime: item.leadTime,
          //     unitCost: item.unitCost
          //   });
          // }
          
          return item;
        });
      
      resolve(parsedData);
    } catch (error) {
      reject(new Error(`Failed to parse Excel file: ${error}`));
    }
  });
}

export function validateInputData(data: InputRow[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (data.length === 0) {
    errors.push('No data found in the Excel file');
  }
  
  data.forEach((row, index) => {
    if (!row.id) {
      errors.push(`Row ${index + 1}: Missing ID`);
    }
    if (!row.warehouse) {
      errors.push(`Row ${index + 1}: Missing warehouse`);
    }
    if (row.demandData.length === 0) {
      errors.push(`Row ${index + 1}: No demand data found`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}