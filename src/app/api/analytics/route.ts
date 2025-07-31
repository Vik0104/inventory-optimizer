import { NextRequest, NextResponse } from 'next/server';
import { InventoryCalculator } from '@/utils/calculationEngine';
import { ExcelMatchingCalculator } from '@/utils/excelMatchingCalculator';
import { globalStore } from '@/lib/globalStore';

export async function GET() {
  try {
    // Check if we have data
    const uploadedData = globalStore.getData();
    console.log(`🔍 Analytics: Checking data - found ${uploadedData.length} items`);
    
    if (uploadedData.length === 0) {
      console.log('❌ Analytics: No data available');
      return NextResponse.json({
        error: 'No data available. Please upload data first.',
        hasData: false
      }, { status: 400 });
    }

    // Get current config
    const currentConfig = globalStore.getConfig();
    console.log('✅ Analytics: Config loaded, starting calculations...');

    // Create Excel-matching calculator
    const excelCalculator = new ExcelMatchingCalculator(currentConfig);
    const calculator = new InventoryCalculator(currentConfig);

    // Calculate results using Excel-matching formulas
    const excelResults = excelCalculator.calculateAllExcelMatching(uploadedData);
    const results = calculator.calculateAll(uploadedData);

    // Calculate Excel-matching summary
    const excelSummary = excelCalculator.calculateExcelSummary(excelResults);
    const summary = calculator.calculateSummary(results);

    // Group results by warehouse for pivot analysis
    const warehouseGroups = results.reduce((groups, result) => {
      const item = uploadedData.find(d => d.id === result.id);
      const warehouse = item?.warehouse || 'Unknown';
      
      if (!groups[warehouse]) {
        groups[warehouse] = [];
      }
      groups[warehouse].push(result);
      return groups;
    }, {} as { [warehouse: string]: typeof results });

    // Calculate warehouse summaries
    const warehouseSummaries = Object.entries(warehouseGroups).map(([warehouse, items]) => ({
      warehouse,
      totalItems: items.length,
      totalActualStock: items.reduce((sum, item) => sum + item.actualStock, 0),
      totalTargetStock: items.reduce((sum, item) => sum + item.targetStock, 0),
      totalSavingsPotential: items.reduce((sum, item) => sum + item.savingsPotential, 0),
      averageServiceLevel: items.reduce((sum, item) => sum + item.serviceLevel, 0) / items.length
    }));

    const response = {
      hasData: true,
      summary,
      excelSummary, // Add Excel-matching summary
      results: results.slice(0, 100), // Limit to first 100 for performance
      excelResults: excelResults.slice(0, 100), // Add Excel-matching results
      warehouseSummaries,
      config: currentConfig,
      totalItems: uploadedData.length
    };

    console.log('✅ Analytics: Calculations complete, returning results');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Analytics calculation error:', error);
    return NextResponse.json({
      error: 'Failed to calculate analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.config) {
      globalStore.setConfig(body.config);
    }
    
    if (body.data) {
      globalStore.setData(body.data);
    }

    return NextResponse.json({ 
      message: 'Data updated successfully',
      hasData: globalStore.hasData()
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to update data'
    }, { status: 400 });
  }
}