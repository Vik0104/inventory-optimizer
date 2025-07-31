'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, TrendingUp, Package, AlertTriangle, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface AnalyticsData {
  hasData: boolean;
  summary?: any;
  results?: any[];
  warehouseSummaries?: any[];
  config?: any;
  totalItems?: number;
  error?: string;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/analytics');
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error || 'Failed to fetch analytics');
      } else {
        setData(result);
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Calculating analytics...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {error || 'No Data Available'}
            </h2>
            <p className="text-gray-600 mb-6">
              Please upload your inventory data first to view analytics.
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

  const { summary, warehouseSummaries, results, config } = data;

  // Prepare chart data
  const warehouseChartData = warehouseSummaries?.map(w => ({
    name: w.warehouse,
    actual: Math.round(w.totalActualStock),
    target: Math.round(w.totalTargetStock),
    savings: Math.round(w.totalSavingsPotential)
  })) || [];

  const topSavingsItems = results?.slice()
    .sort((a, b) => b.savingsPotential - a.savingsPotential)
    .slice(0, 10) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          </div>
          
          <button
            onClick={fetchAnalytics}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Savings Potential</p>
                <p className="text-2xl font-bold text-green-600">
                  {summary.totalSavingsPotential.toLocaleString()} {config.currency}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Service Level</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(summary.averageServiceLevel * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <RefreshCw className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Inventory Turnover</p>
                <p className="text-2xl font-bold text-orange-600">
                  {summary.inventoryTurnover.toFixed(1)}x
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Warehouse Comparison */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Warehouse Stock Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={warehouseChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} ${config.currency}`, '']} />
                <Bar dataKey="actual" fill="#8884d8" name="Actual Stock" />
                <Bar dataKey="target" fill="#82ca9d" name="Target Stock" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Savings Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Savings by Warehouse
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={warehouseChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="savings"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {warehouseChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} ${config.currency}`, 'Savings']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Warehouse Summary Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Warehouse Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Warehouse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual Stock ({config.currency})
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target Stock ({config.currency})
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Savings Potential ({config.currency})
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Service Level
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {warehouseSummaries?.map((warehouse, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {warehouse.warehouse}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {warehouse.totalItems}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {warehouse.totalActualStock.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {warehouse.totalTargetStock.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {warehouse.totalSavingsPotential.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(warehouse.averageServiceLevel * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Savings Opportunities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Savings Opportunities
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Savings Potential ({config.currency})
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Level
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topSavingsItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.actualStock.toFixed(0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.targetStock.toFixed(0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {item.savingsPotential.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(item.serviceLevel * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}