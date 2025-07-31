import Link from 'next/link'
import { Upload, Settings, BarChart3, Database } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Inventory Optimizer Lite
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Advanced inventory optimization tool with demand forecasting, safety stock calculations, and comprehensive analytics.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Link href="/config" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuration</h3>
              <p className="text-gray-600 text-sm">Manage model parameters, units, and time periods</p>
            </div>
          </Link>

          <Link href="/upload" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 group-hover:bg-green-200 transition-colors">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Upload</h3>
              <p className="text-gray-600 text-sm">Upload Excel files with inventory and demand data</p>
            </div>
          </Link>

          <Link href="/analytics" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 group-hover:bg-purple-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">View calculations, forecasts, and optimization results</p>
            </div>
          </Link>

          <Link href="/summary" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4 group-hover:bg-orange-200 transition-colors">
                <Database className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
              <p className="text-gray-600 text-sm">Executive summary and savings potential analysis</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}