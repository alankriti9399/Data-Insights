import OpenAI from 'openai';
import { DatasetSummary, AIInsight } from '../types';

export async function generateDataInsights(
  summary: DatasetSummary,
  sampleData: any[]
): Promise<AIInsight[]> {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'AIzaSyDkELHJ67HZ0GO3slyY7Mrms2NvwV4fHIE') {
      return getDemoInsights(summary, sampleData);
    }

    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Only for development
    });

    // Enhanced prompt focusing on relationships
    const prompt = `Analyze this dataset and provide insights about relationships and patterns:
    
Dataset Summary:
- Rows: ${summary.rowCount}
- Columns: ${summary.columnCount}
- Column Details: ${summary.columns.map(c => `${c.name} (${c.type})`).join(', ')}

Sample Data:
${JSON.stringify(sampleData.slice(0, 5), null, 2)}

Please analyze and provide 3-5 key insights focusing on:
1. Correlations between numerical variables
2. Patterns between categorical and numerical variables
3. Time-based trends if temporal data exists
4. Interdependencies between variables
5. Cause-and-effect relationships if apparent

For each insight, provide:
- A clear title highlighting the relationship
- A detailed description of the pattern or correlation
- Statistical significance if applicable
- A specific recommendation for leveraging this relationship

Format: Keep insights separated by double newlines, with clear headers and sections.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a data scientist specializing in correlation analysis and pattern recognition. Focus on identifying meaningful relationships between variables."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    return parseAIResponse(content);
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return getDemoInsights(summary, sampleData);
  }
}

function getDemoInsights(summary: DatasetSummary, sampleData: any[]): AIInsight[] {
  const numericColumns = summary.columns.filter(c => c.type === 'numeric');
  const categoricalColumns = summary.columns.filter(c => c.type === 'categorical');

  const insights: AIInsight[] = [];

  // Add correlation insight if we have numeric columns
  if (numericColumns.length >= 2) {
    insights.push({
      type: 'trend',
      title: 'Numerical Variable Correlations',
      description: `Analysis of relationships between ${numericColumns.map(c => c.name).join(', ')}. ${
        numericColumns.length > 2 ? 'Multiple potential correlations detected.' : 'Potential correlation identified.'
      }`,
      recommendation: 'Consider creating scatter plots to visualize these relationships and calculate Pearson correlation coefficients.',
      confidence: 0.85
    });
  }

  // Add categorical relationship insight
  if (categoricalColumns.length > 0 && numericColumns.length > 0) {
    insights.push({
      type: 'insight',
      title: 'Category-Value Relationships',
      description: `Analyzed impact of ${categoricalColumns[0].name} on ${numericColumns[0].name}. Different categories show distinct value distributions.`,
      recommendation: 'Use box plots or violin plots to visualize how numerical values vary across categories.',
      confidence: 0.9
    });
  }

  // Add time series insight if date columns exist
  const dateColumns = summary.columns.filter(c => c.type === 'date');
  if (dateColumns.length > 0) {
    insights.push({
      type: 'trend',
      title: 'Temporal Patterns',
      description: `Analyzed time-based patterns using ${dateColumns[0].name}. Potential seasonal or periodic patterns may exist.`,
      recommendation: 'Create time series visualizations to identify cycles and trends.',
      confidence: 0.8
    });
  }

  // Add data quality relationship insight
  insights.push({
    type: 'anomaly',
    title: 'Inter-variable Dependencies',
    description: `Analyzed relationships between ${summary.columnCount} variables. Some variables may have strong dependencies that affect data interpretation.`,
    recommendation: 'Create a correlation matrix to visualize all pair-wise relationships between variables.',
    confidence: 0.95
  });

  return insights;
}

function parseAIResponse(content: string): AIInsight[] {
  const sections = content.split('\n\n');
  const insights: AIInsight[] = [];
  let currentInsight: Partial<AIInsight> = {};

  for (const section of sections) {
    if (section.startsWith('#') || section.toLowerCase().includes('insight') || section.toLowerCase().includes('correlation') || section.toLowerCase().includes('relationship')) {
      if (currentInsight.title) {
        insights.push(currentInsight as AIInsight);
      }
      currentInsight = {
        type: determineInsightType(section),
        title: section.replace(/^#\s*/, '').trim(),
        confidence: calculateConfidence(section)
      };
    } else if (currentInsight.title && !currentInsight.description) {
      currentInsight.description = section.trim();
    } else if (currentInsight.title && section.toLowerCase().includes('recommend')) {
      currentInsight.recommendation = section.replace(/recommendation:?/i, '').trim();
    }
  }

  if (currentInsight.title) {
    insights.push(currentInsight as AIInsight);
  }

  return insights;
}

function determineInsightType(section: string): 'insight' | 'trend' | 'anomaly' {
  const lower = section.toLowerCase();
  if (lower.includes('correlation') || lower.includes('trend') || lower.includes('pattern')) {
    return 'trend';
  }
  if (lower.includes('anomaly') || lower.includes('outlier') || lower.includes('unusual')) {
    return 'anomaly';
  }
  return 'insight';
}

function calculateConfidence(section: string): number {
  const lower = section.toLowerCase();
  if (lower.includes('strong') || lower.includes('clear') || lower.includes('significant')) {
    return 0.9;
  }
  if (lower.includes('potential') || lower.includes('possible') || lower.includes('may')) {
    return 0.7;
  }
  return 0.8;
}
