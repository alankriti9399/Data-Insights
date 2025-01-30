import React, { useState } from 'react';
import { Send, Brain, Loader } from 'lucide-react';
import OpenAI from 'openai';

interface AIPromptProps {
  data: any[];
  isLoading: boolean;
}

export function AIPrompt({ data, isLoading }: AIPromptProps) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey) {
        setResponse('API key not configured. Please set up your OpenAI API key.');
        return;
      }

      const openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true // Only for development
      });

      const enhancedPrompt = `Given this dataset sample:
${JSON.stringify(data.slice(0, 5), null, 2)}

User's question: ${prompt}

Please analyze the data and provide a clear, concise response.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a data analysis expert. Provide clear, actionable insights based on the data provided."
          },
          {
            role: "user",
            content: enhancedPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      setResponse(response.choices[0].message.content || 'No response generated');
    } catch (error: any) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-semibold">Ask AI About Your Data</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask a question about your data..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isProcessing || isLoading}
          />
          <button
            type="submit"
            disabled={isProcessing || isLoading || !prompt.trim()}
            className="absolute bottom-3 right-3 p-2 text-white bg-purple-600 rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>

      {response && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">AI Response:</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
        </div>
      )}

      {isLoading && (
        <div className="mt-6 flex items-center justify-center">
          <Loader className="w-6 h-6 text-purple-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading data...</span>
        </div>
      )}
    </div>
  );
}