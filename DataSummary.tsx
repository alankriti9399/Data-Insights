import React from 'react';
import { BarChart2, TrendingUp, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { DatasetSummary } from '../types';

interface DataSummaryProps {
  summary: DatasetSummary;
}

export function DataSummary({ summary }: DataSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Dataset Overview</h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-600 mb-2">
            <BarChart2 className="w-5 h-5" />
            <span className="font-medium">Total Rows</span>
          </div>
          <p className="text-3xl font-bold text-blue-900">{summary.rowCount.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg">
          <div className="flex items-center space-x-2 text-purple-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Columns</span>
          </div>
          <p className="text-3xl font-bold text-purple-900">{summary.columnCount}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg">
          <div className="flex items-center space-x-2 text-green-600 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Insights</span>
          </div>
          <p className="text-3xl font-bold text-green-900">{summary.insights.length}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Column Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.columns.map((column) => (
              <div key={column.name} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">{column.name}</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
                    {column.type}
                  </span>
                </div>
                {column.type === 'numeric' ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Range:</span>
                      <span className="font-medium">
                        {column.summary.min} - {column.summary.max}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mean:</span>
                      <span className="font-medium">
                        {typeof column.summary.mean === 'number'
                          ? column.summary.mean.toFixed(2)
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unique Values:</span>
                      <span className="font-medium">{column.summary.uniqueValues}</span>
                    </div>
                    {column.summary.mostCommon && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Most Common:</span>
                        <span className="font-medium">
                          {column.summary.mostCommon.slice(0, 3).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
          <div className="space-y-4">
            {summary.insights.map((insight, index) => (
              <div
                key={index}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-2 mb-2">
                  {insight.significance > 0.7 ? (
                    <ArrowUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <ArrowDown className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium text-gray-900">{insight.columnName}</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {insight.insightType}
                  </span>
                </div>
                <p className="text-gray-600">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}