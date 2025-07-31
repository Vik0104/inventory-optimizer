'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, FileSpreadsheet, Calculator, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ComparisonData {
  excelSummary?: any;
  summary?: any;
  excelResults?: any[];
  results?: any[];
  hasData: boolean;
  error?: string;
}

const targetExcelValues = {
  yearlyDemand: { units: 2381348, eur: 121903918 },
  actualTotalInventory: { units: 400898, eur: 19346421 },
  targetTotalInventory: { units: 205451, eur: 9866807 },
  totalPotential: { units: 195446, eur: 9479614, percentage: 49 },
  actualSafetyStock: { units: 88660, eur: 4477200 },
  targetSafetyStock: { units: 158694, eur: 7875215 },
  targetCycleStock: { units: 46758, eur: 1991593 }
};

export default function ComparisonPage() {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchComparison();
  }, []);

  const fetchComparison = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/analytics');
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error || 'Failed to fetch comparison data');
      } else {
        setData(result);
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(Math.round(num));
  };

  const calculateDifference = (actual: number, target: number): { diff: number; percent: number } => {
    const diff = actual - target;
    const percent = target !== 0 ? Math.abs(diff / target) * 100 : 0;
    return { diff, percent };
  };

  const ComparisonRow = ({ 
    label, 
    excelValue, 
    appValue, 
    targetValue, 
    unit = '' 
  }: { 
    label: string; 
    excelValue?: number; 
    appValue?: number; 
    targetValue: number; 
    unit?: string;
  }) => {
    const excelDiff = excelValue ? calculateDifference(excelValue, targetValue) : null;
    const appDiff = appValue ? calculateDifference(appValue, targetValue) : null;
    
    return (
      <tr className="border-b">
        <td className="py-3 px-4 font-medium">{label}</td>
        <td className="py-3 px-4 text-blue-600 font-mono">
          {formatNumber(targetValue)}{unit}
        </td>
        <td className="py-3 px-4 font-mono">
          {excelValue ? formatNumber(excelValue) : 'N/A'}{unit}
          {excelDiff && (
            <div className={`text-xs mt-1 ${Math.abs(excelDiff.percent) < 5 ? 'text-green-600' : 'text-red-600'}`}>
              {excelDiff.percent < 5 ? '✓' : '⚠'} {excelDiff.percent.toFixed(1)}% diff
            </div>
          )}
        </td>
        <td className="py-3 px-4 font-mono">
          {appValue ? formatNumber(appValue) : 'N/A'}{unit}
          {appDiff && (
            <div className={`text-xs mt-1 ${Math.abs(appDiff.percent) < 5 ? 'text-green-600' : 'text-red-600'}`}>
              {appDiff.percent < 5 ? '✓' : '⚠'} {appDiff.percent.toFixed(1)}% diff
            </div>
          )}
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calculator className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading comparison data...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.hasData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-8">
            <Link 
              href="/" 
              className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Excel vs App Comparison</h1>
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              No Data Available
            </h2>
            <p className="text-gray-600 mb-6">
              Please upload inventory data first to compare results.
            </p>
            <Link 
              href="/upload"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 inline-flex items-center"
            >
              Upload Data
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { excelSummary, summary } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link 
            href="/" 
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Excel vs App Comparison</h1>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center mb-6">
            <FileSpreadsheet className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              Calculation Results Comparison
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metric
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Excel Target
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    App Result (Excel-Matching)
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    App Result (Original)
                  </th>
                </tr>
              </thead>
              <tbody>
                <ComparisonRow
                  label="Yearly Demand (Units)"
                  excelValue={excelSummary?.yearlyDemand?.units}
                  appValue={summary?.totalItems} // placeholder
                  targetValue={targetExcelValues.yearlyDemand.units}
                />
                <ComparisonRow
                  label="Yearly Demand (EUR)"
                  excelValue={excelSummary?.yearlyDemand?.eur}
                  appValue={summary?.totalSavingsPotential} // placeholder
                  targetValue={targetExcelValues.yearlyDemand.eur}
                  unit=" EUR"
                />
                <ComparisonRow
                  label="Actual Total Inventory (Units)"
                  excelValue={excelSummary?.actualTotalInventory?.units}
                  appValue={summary?.totalActualStock}
                  targetValue={targetExcelValues.actualTotalInventory.units}
                />
                <ComparisonRow
                  label="Actual Total Inventory (EUR)"
                  excelValue={excelSummary?.actualTotalInventory?.eur}
                  appValue={summary?.totalSavingsPotential} // placeholder
                  targetValue={targetExcelValues.actualTotalInventory.eur}
                  unit=" EUR"
                />
                <ComparisonRow
                  label="Target Total Inventory (Units)"
                  excelValue={excelSummary?.targetTotalInventory?.units}
                  appValue={summary?.totalTargetStock}
                  targetValue={targetExcelValues.targetTotalInventory.units}
                />
                <ComparisonRow
                  label="Target Total Inventory (EUR)"
                  excelValue={excelSummary?.targetTotalInventory?.eur}
                  appValue={summary?.totalSavingsPotential} // placeholder
                  targetValue={targetExcelValues.targetTotalInventory.eur}
                  unit=" EUR"
                />
                <ComparisonRow
                  label="Total Potential (Units)"
                  excelValue={excelSummary?.totalPotential?.units}
                  appValue={summary?.totalSavingsPotential} // placeholder
                  targetValue={targetExcelValues.totalPotential.units}
                />
                <ComparisonRow
                  label="Total Potential (EUR)"
                  excelValue={excelSummary?.totalPotential?.eur}
                  appValue={summary?.totalSavingsPotential}
                  targetValue={targetExcelValues.totalPotential.eur}
                  unit=" EUR"
                />
                <ComparisonRow
                  label="Total Potential (%)"
                  excelValue={excelSummary?.totalPotential?.percentage}
                  appValue={50} // placeholder
                  targetValue={targetExcelValues.totalPotential.percentage}
                  unit="%"
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Excel Summary</h3>
            {excelSummary ? (
              <pre className="text-sm bg-gray-50 p-4 rounded overflow-x-auto">
                {JSON.stringify(excelSummary, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">No Excel summary available</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">App Summary</h3>
            {summary ? (
              <pre className="text-sm bg-gray-50 p-4 rounded overflow-x-auto">
                {JSON.stringify(summary, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">No app summary available</p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Comparison Guide
          </h3>
          <ul className="text-blue-800 space-y-2">
            <li>• <strong>Green ✓</strong>: Difference &lt; 5% (Good match)</li>
            <li>• <strong>Red ⚠</strong>: Difference ≥ 5% (Needs adjustment)</li>
            <li>• Target values are from the original Excel file</li>
            <li>• Excel-Matching uses formulas that replicate Excel calculations</li>
            <li>• Original uses the standard inventory optimization formulas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}