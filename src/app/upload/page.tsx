'use client';

import { useState, useRef } from 'react';
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface UploadResponse {
  message?: string;
  rowCount?: number;
  preview?: any[];
  error?: string;
  details?: string[];
}

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result: UploadResponse = await response.json();
      setUploadResult(result);
    } catch (error) {
      setUploadResult({
        error: 'Failed to upload file. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Data Upload</h1>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Upload Area */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upload Inventory Data
            </h2>
            <p className="text-gray-600 mb-6">
              Upload your Excel file containing inventory parameters, demand data, and historic inventory information.
            </p>

            <div
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                ${dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
                ${uploading ? 'pointer-events-none opacity-50' : ''}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInput}
                className="hidden"
              />
              
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-blue-500 animate-bounce mb-4" />
                  <p className="text-lg text-blue-600">Uploading and processing...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FileSpreadsheet className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-lg text-gray-600 mb-2">
                    Drag and drop your Excel file here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports .xlsx and .xls files
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Result */}
          {uploadResult && (
            <div className="bg-white rounded-lg shadow-md p-8">
              {uploadResult.error ? (
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                      Upload Failed
                    </h3>
                    <p className="text-red-700 mb-4">{uploadResult.error}</p>
                    {uploadResult.details && (
                      <div className="bg-red-50 rounded-md p-4">
                        <h4 className="font-medium text-red-800 mb-2">Details:</h4>
                        <ul className="list-disc list-inside text-red-700 space-y-1">
                          {uploadResult.details.map((detail, index) => (
                            <li key={index}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      Upload Successful
                    </h3>
                    <p className="text-green-700 mb-4">
                      {uploadResult.message} - {uploadResult.rowCount} rows processed
                    </p>
                    
                    {uploadResult.preview && uploadResult.preview.length > 0 && (
                      <div className="bg-green-50 rounded-md p-4">
                        <h4 className="font-medium text-green-800 mb-2">Preview (first 5 rows):</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="border-b border-green-200">
                                <th className="text-left py-2 px-3 text-green-800">ID</th>
                                <th className="text-left py-2 px-3 text-green-800">Description</th>
                                <th className="text-left py-2 px-3 text-green-800">Warehouse</th>
                                <th className="text-left py-2 px-3 text-green-800">Strategy</th>
                                <th className="text-left py-2 px-3 text-green-800">Demand Points</th>
                              </tr>
                            </thead>
                            <tbody>
                              {uploadResult.preview.map((row, index) => (
                                <tr key={index} className="border-b border-green-100">
                                  <td className="py-2 px-3 text-green-700">{row.id}</td>
                                  <td className="py-2 px-3 text-green-700">{row.description}</td>
                                  <td className="py-2 px-3 text-green-700">{row.warehouse}</td>
                                  <td className="py-2 px-3 text-green-700">{row.replenishmentStrategy}</td>
                                  <td className="py-2 px-3 text-green-700">{row.demandData?.length || 0}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <Link 
                        href="/analytics"
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 inline-flex items-center"
                      >
                        Proceed to Analytics
                        <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Excel File Requirements
            </h3>
            <ul className="text-blue-800 space-y-2">
              <li>• File must contain an "Input" sheet with inventory data</li>
              <li>• Demand data should be in columns AG through PP (13 periods)</li>
              <li>• Historic inventory data should be in columns PR through AFA</li>
              <li>• Each row should have ID, Description, Warehouse, and Replenishment Strategy</li>
              <li>• Use the same format as the provided template</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}