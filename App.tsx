import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataSummary } from './components/DataSummary';
import { DataVisualizer } from './components/DataVisualizer';
import { AIInsights } from './components/AIInsights';
import { AIPrompt } from './components/AIPrompt';
import { Auth } from './components/Auth';
import { DatasetSummary, DataColumn, AIInsight } from './types';
import { parse } from 'papaparse';
import { BarChart, Search, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';
import { generateDataInsights } from './lib/aiAnalysis';

function App() {
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [session, setSession] = useState<any>(null);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  useEffect(() => {
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    } catch (error: any) {
      setSupabaseError(error.message);
    }
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const analyzeData = useCallback(async (parsedData: any[]) => {
    const columns: DataColumn[] = Object.keys(parsedData[0]).map((key) => {
      const values = parsedData.map((row) => row[key]);
      const isNumeric = values.every((v) => !isNaN(Number(v)));
      
      return {
        name: key,
        type: isNumeric ? 'numeric' : 'categorical',
        summary: isNumeric
          ? {
              min: Math.min(...values.map(Number)),
              max: Math.max(...values.map(Number)),
              mean: values.reduce((a, b) => a + Number(b), 0) / values.length,
            }
          : {
              uniqueValues: new Set(values).size,
              mostCommon: [...new Set(values)].slice(0, 5),
            },
      };
    });

    const insights = columns
      .filter((col) => col.type === 'numeric')
      .map((col) => ({
        columnName: col.name,
        insightType: 'distribution' as const,
        description: `${col.name} ranges from ${col.summary.min} to ${
          col.summary.max
        } with an average of ${col.summary.mean?.toFixed(2)}`,
        significance: 0.8,
      }));

    const newSummary = {
      rowCount: parsedData.length,
      columnCount: columns.length,
      columns,
      insights,
    };

    setSummary(newSummary);

    setIsLoadingInsights(true);
    try {
      const aiGeneratedInsights = await generateDataInsights(newSummary, parsedData);
      setAIInsights(aiGeneratedInsights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setIsLoadingInsights(false);
    }
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    parse(file, {
      header: true,
      complete: (results) => {
        setData(results.data);
        analyzeData(results.data);
        setSelectedColumns(Object.keys(results.data[0]).slice(0, 4));
      },
    });
  }, [analyzeData]);

  if (supabaseError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Setup Required</h2>
            <p>Please click the "Connect to Supabase" button in the top right corner to set up your database connection.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="https://assets.upgrad.com/1827/_next/static/media/upgrad-header-logo.325f003e.svg"
                alt="upGrad Logo"
                className="h-8"
              />
              <div className="flex items-center space-x-2">
                <BarChart className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Data Insight Explorer</h1>
                  <p className="text-sm text-gray-500">Advanced Data Analysis Platform</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!data.length ? (
          <div className="mb-8">
            <FileUpload onFileSelect={handleFileSelect} />
          </div>
        ) : (
          <div className="space-y-8">
            {summary && <DataSummary summary={summary} />}
            
            <AIPrompt data={data} isLoading={isLoadingInsights} />
            
            <AIInsights insights={aiInsights} isLoading={isLoadingInsights} />

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Data Visualization</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search columns..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {summary?.columns.map((column) => (
                  <button
                    key={column.name}
                    onClick={() => 
                      setSelectedColumns((prev) =>
                        prev.includes(column.name)
                          ? prev.filter((c) => c !== column.name)
                          : [...prev, column.name]
                      )
                    }
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedColumns.includes(column.name)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {column.name}
                  </button>
                ))}
              </div>

              <DataVisualizer
                data={data}
                columns={summary?.columns || []}
                selectedColumns={selectedColumns}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;