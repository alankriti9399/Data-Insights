export interface DataColumn {
  name: string;
  type: 'numeric' | 'categorical' | 'date';
  summary: {
    min?: number;
    max?: number;
    mean?: number;
    median?: number;
    uniqueValues?: number;
    mostCommon?: string[];
  };
}

export interface DataInsight {
  columnName: string;
  insightType: 'correlation' | 'outlier' | 'trend' | 'distribution';
  description: string;
  significance: number;
}

export interface AIInsight {
  type: 'insight' | 'trend' | 'anomaly';
  title: string;
  description: string;
  recommendation?: string;
  confidence: number;
}

export interface DatasetSummary {
  rowCount: number;
  columnCount: number;
  columns: DataColumn[];
  insights: DataInsight[];
}