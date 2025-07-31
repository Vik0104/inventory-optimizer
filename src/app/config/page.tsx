'use client';

import { useState, useEffect } from 'react';
import { Config } from '@/types';
import { ArrowLeft, Save, Settings } from 'lucide-react';
import Link from 'next/link';

export default function ConfigPage() {
  const [config, setConfig] = useState<Config>({
    volumeUnits: 'unit',
    currency: 'EUR',
    otherMeasure: 'kg',
    inputTimeUnit: 'day',
    forecastingPeriod: 'monthly',
    reorderQuantityApproach: 'EOQ'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (response.ok) {
        setMessage('Configuration saved successfully!');
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      setMessage('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof Config, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading configuration...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Model Configuration</h1>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volume Units
              </label>
              <select
                value={config.volumeUnits}
                onChange={(e) => handleInputChange('volumeUnits', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="unit">unit</option>
                <option value="units">units</option>
                <option value="pieces">pieces</option>
                <option value="items">items</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={config.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other Measure
              </label>
              <select
                value={config.otherMeasure}
                onChange={(e) => handleInputChange('otherMeasure', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
                <option value="tons">tons</option>
                <option value="m3">m³</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Input Time Unit
              </label>
              <select
                value={config.inputTimeUnit}
                onChange={(e) => handleInputChange('inputTimeUnit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">day</option>
                <option value="week">week</option>
                <option value="month">month</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forecasting Period
              </label>
              <select
                value={config.forecastingPeriod}
                onChange={(e) => handleInputChange('forecastingPeriod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">daily</option>
                <option value="weekly">weekly</option>
                <option value="monthly">monthly</option>
                <option value="quarterly">quarterly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reorder Quantity Approach
              </label>
              <select
                value={config.reorderQuantityApproach}
                onChange={(e) => handleInputChange('reorderQuantityApproach', e.target.value as 'EOQ' | 'Direct input')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="EOQ">EOQ</option>
                <option value="Direct input">Direct input</option>
              </select>
            </div>

            {message && (
              <div className={`p-4 rounded-md ${
                message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}>
                {message}
              </div>
            )}

            <button
              onClick={saveConfig}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {saving ? (
                <>
                  <Settings className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}