import React from 'react';
import { Brain, Lightbulb, TrendingUp, AlertTriangle, Server } from 'lucide-react';
import { AIInsight } from '../types';

interface AIInsightsProps {
  insights: AIInsight[];
  isLoading: boolean;
}

export function AIInsights({ insights, isLoading }: AIInsightsProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Brain className="w-6 h-6 text-purple-600 animate-pulse" />
          <h2 className="text-xl font-semibold">AI Analysis in Progress</h2>
        </div>
        <div className="space-y-4">
          <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold">AI-Generated Insights</h2>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Server className="w-4 h-4" />
          <span>Demo Mode</span>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> This is running in demo mode with sample insights. For production use, implement the OpenAI integration on a secure backend server.
        </p>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100"
          >
            <div className="flex items-start space-x-3">
              {insight.type === 'insight' && (
                <Lightbulb className="w-5 h-5 text-yellow-500 mt-1" />
              )}
              {insight.type === 'trend' && (
                <TrendingUp className="w-5 h-5 text-blue-500 mt-1" />
              )}
              {insight.type === 'anomaly' && (
                <AlertTriangle className="w-5 h-5 text-red-500 mt-1" />
              )}
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {insight.title}
                </h3>
                <p className="text-gray-700">{insight.description}</p>
                {insight.recommendation && (
                  <p className="mt-2 text-sm text-purple-700 bg-purple-50 p-2 rounded">
                    💡 Recommendation: {insight.recommendation}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}