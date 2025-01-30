import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { DataColumn } from '../types';

interface DataVisualizerProps {
  data: any[];
  columns: DataColumn[];
  selectedColumns: string[];
}

const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981'];

export function DataVisualizer({ data, columns, selectedColumns }: DataVisualizerProps) {
  const getVisualizationType = (column: DataColumn) => {
    if (column.type === 'numeric') {
      return data.length > 20 ? 'line' : 'bar';
    }
    return column.summary.uniqueValues && column.summary.uniqueValues < 10 ? 'pie' : 'bar';
  };

  const processDataForVisualization = (columnName: string, type: string) => {
    if (type === 'pie') {
      const counts: { [key: string]: number } = {};
      data.forEach((item) => {
        const value = item[columnName];
        counts[value] = (counts[value] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }
    return data;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {selectedColumns.map((columnName) => {
        const column = columns.find((c) => c.name === columnName);
        if (!column) return null;

        const visualizationType = getVisualizationType(column);
        const processedData = processDataForVisualization(columnName, visualizationType);

        return (
          <div key={columnName} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">{columnName}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {visualizationType === 'bar' ? (
                  <BarChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={columnName} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey={columnName} fill="#4F46E5">
                      {processedData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : visualizationType === 'line' ? (
                  <LineChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={columnName} />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey={columnName}
                      stroke="#4F46E5"
                      strokeWidth={2}
                      dot={{ fill: '#4F46E5' }}
                    />
                  </LineChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={processedData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {processedData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}