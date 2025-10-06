export interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  normalRange: { min: number; max: number };
  status: 'normal' | 'abnormal' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
}

export interface ReportInsight {
  type: 'improvement' | 'concern' | 'stable' | 'new_finding';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  recommendation?: string;
  relatedMetrics: string[];
}

export interface HealthScore {
  overall: number;
  cardiovascular: number;
  metabolic: number;
  liver: number;
  kidney: number;
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
}

export interface ReportComparison {
  current: string;
  previous: string;
  changes: {
    improved: string[];
    worsened: string[];
    new: string[];
    resolved: string[];
  };
  overallTrend: 'improving' | 'stable' | 'declining';
}

// Common medical metrics and their normal ranges
export const MEDICAL_METRICS = {
  // Cardiovascular
  'Heart Rate': { min: 60, max: 100, unit: 'bpm' },
  'Blood Pressure (Systolic)': { min: 90, max: 120, unit: 'mmHg' },
  'Blood Pressure (Diastolic)': { min: 60, max: 80, unit: 'mmHg' },
  'Cholesterol Total': { min: 0, max: 200, unit: 'mg/dL' },
  'HDL Cholesterol': { min: 40, max: 200, unit: 'mg/dL' },
  'LDL Cholesterol': { min: 0, max: 100, unit: 'mg/dL' },
  'Triglycerides': { min: 0, max: 150, unit: 'mg/dL' },
  
  // Metabolic
  'Glucose': { min: 70, max: 100, unit: 'mg/dL' },
  'HbA1c': { min: 4, max: 5.7, unit: '%' },
  'Insulin': { min: 2, max: 25, unit: 'μU/mL' },
  
  // Liver Function
  'ALT': { min: 7, max: 56, unit: 'U/L' },
  'AST': { min: 10, max: 40, unit: 'U/L' },
  'Bilirubin Total': { min: 0.1, max: 1.2, unit: 'mg/dL' },
  'ALP': { min: 44, max: 147, unit: 'U/L' },
  
  // Kidney Function
  'Creatinine': { min: 0.6, max: 1.2, unit: 'mg/dL' },
  'BUN': { min: 6, max: 24, unit: 'mg/dL' },
  'eGFR': { min: 90, max: 120, unit: 'mL/min/1.73m²' },
  
  // Complete Blood Count
  'Hemoglobin': { min: 12, max: 16, unit: 'g/dL' },
  'Hematocrit': { min: 36, max: 46, unit: '%' },
  'WBC': { min: 4.5, max: 11, unit: 'K/μL' },
  'Platelets': { min: 150, max: 450, unit: 'K/μL' },
  
  // Thyroid
  'TSH': { min: 0.4, max: 4, unit: 'mIU/L' },
  'T3': { min: 80, max: 200, unit: 'ng/dL' },
  'T4': { min: 4.5, max: 12, unit: 'μg/dL' },
};

export function extractMetricsFromReport(reportText: string): HealthMetric[] {
  const metrics: HealthMetric[] = [];
  const lines = reportText.split('\n');
  
  // Debug: Log the report text to see what we're working with
  console.log('Extracting metrics from report:', reportText.substring(0, 500));
  
  // More comprehensive patterns for different report formats
  const patterns = {
    'Heart Rate': [
      /(?:heart rate|hr|pulse|pulse rate)[\s:]*(\d+)/gi, 
      /(\d+)\s*bpm/gi,
      /heart[\s\w]*rate[\s:]*(\d+)/gi
    ],
    'Blood Pressure (Systolic)': [
      /(?:systolic|syst|bp systolic)[\s:]*(\d+)/gi, 
      /blood pressure[\s:]*(\d{2,3})\/\d{2,3}/gi,
      /bp[\s:]*(\d{2,3})\/\d{2,3}/gi,
      /(\d{2,3})\/\d{2,3}\s*mmhg/gi,
      /blood pressure[\s:]*(\d{2,3})\/\d{2,3}\s*mmhg/gi
    ],
    'Blood Pressure (Diastolic)': [
      /(?:diastolic|diast|bp diastolic)[\s:]*(\d+)/gi, 
      /blood pressure[\s:]*\d{2,3}\/(\d{2,3})/gi,
      /bp[\s:]*\d{2,3}\/(\d{2,3})/gi,
      /\d{2,3}\/(\d{2,3})\s*mmhg/gi,
      /blood pressure[\s:]*\d{2,3}\/(\d{2,3})\s*mmhg/gi
    ],
    'Cholesterol Total': [
      /(?:total cholesterol|cholesterol total|cholesterol|total chol)[\s:]*(\d+)/gi,
      /chol[\s:]*(\d+)/gi
    ],
    'HDL Cholesterol': [
      /(?:hdl|hdl cholesterol|hdl-c)[\s:]*(\d+)/gi,
      /high density lipoprotein[\s:]*(\d+)/gi
    ],
    'LDL Cholesterol': [
      /(?:ldl|ldl cholesterol|ldl-c)[\s:]*(\d+)/gi,
      /low density lipoprotein[\s:]*(\d+)/gi
    ],
    'Triglycerides': [
      /(?:triglycerides|trig|triglyceride)[\s:]*(\d+)/gi
    ],
    'Glucose': [
      /(?:glucose|blood sugar|bs|blood glucose|glucose level)[\s:]*(\d+)/gi,
      /sugar[\s:]*(\d+)/gi
    ],
    'HbA1c': [
      /(?:hba1c|a1c|hemoglobin a1c|hba1c)[\s:]*(\d+\.?\d*)/gi,
      /glycated hemoglobin[\s:]*(\d+\.?\d*)/gi
    ],
    'Creatinine': [
      /(?:creatinine|creat|serum creatinine)[\s:]*(\d+\.?\d*)/gi
    ],
    'BUN': [
      /(?:bun|blood urea nitrogen|urea nitrogen)[\s:]*(\d+)/gi
    ],
    'ALT': [
      /(?:alt|alanine aminotransferase|sgot)[\s:]*(\d+)/gi
    ],
    'AST': [
      /(?:ast|aspartate aminotransferase|sgpt)[\s:]*(\d+)/gi
    ],
    'Bilirubin': [
      /(?:bilirubin|total bilirubin|serum bilirubin)[\s:]*(\d+\.?\d*)/gi
    ],
    'ALP': [
      /(?:alp|alkaline phosphatase)[\s:]*(\d+)/gi
    ]
  };
  
  for (const [metricName, ranges] of Object.entries(MEDICAL_METRICS)) {
    const metricPatterns = patterns[metricName as keyof typeof patterns] || [
      new RegExp(`${metricName}[\\s:]*([\\d.]+)`, 'i')
    ];
    
    for (const pattern of metricPatterns) {
      for (const line of lines) {
        const match = line.match(pattern);
        if (match) {
          const value = parseFloat(match[1]);
          if (!isNaN(value) && value > 0) {
            console.log(`Found ${metricName}: ${value} ${ranges.unit} in line: ${line.trim()}`);
            const status = getMetricStatus(value, ranges);
            metrics.push({
              name: metricName,
              value,
              unit: ranges.unit,
              normalRange: { min: ranges.min, max: ranges.max },
              status,
              trend: 'stable'
            });
            break; // Found this metric, move to next
          }
        }
      }
    }
  }
  
  // Fallback: Look for any numbers with medical units that we might have missed
  if (metrics.length === 0) {
    console.log('No metrics found with specific patterns, trying fallback...');
    const fallbackPatterns = [
      { name: 'Blood Pressure (Systolic)', pattern: /blood pressure[\s:]*(\d{2,3})\/\d{2,3}/gi, unit: 'mmHg' },
      { name: 'Blood Pressure (Diastolic)', pattern: /blood pressure[\s:]*\d{2,3}\/(\d{2,3})/gi, unit: 'mmHg' },
      { name: 'Heart Rate', pattern: /(?:heart rate|pulse)[\s:]*(\d{2,3})/gi, unit: 'bpm' },
      { name: 'Glucose', pattern: /(?:glucose|rbs)[\s:]*(\d{2,3})/gi, unit: 'mg/dL' },
      { name: 'Cholesterol Total', pattern: /(?:cholesterol|chol)[\s:]*(\d{2,3})/gi, unit: 'mg/dL' }
    ];
    
    for (const fallback of fallbackPatterns) {
      const matches = reportText.match(fallback.pattern);
      if (matches) {
        for (const match of matches) {
          const value = parseFloat(match.match(/\d+/)?.[0] || '0');
          if (value > 0) {
            console.log(`Fallback found ${fallback.name}: ${value} ${fallback.unit}`);
            const ranges = MEDICAL_METRICS[fallback.name as keyof typeof MEDICAL_METRICS];
            if (ranges) {
              const status = getMetricStatus(value, ranges);
              metrics.push({
                name: fallback.name,
                value,
                unit: fallback.unit,
                normalRange: { min: ranges.min, max: ranges.max },
                status,
                trend: 'stable'
              });
            }
          }
        }
      }
    }
  }
  
  // Remove duplicates - keep the first occurrence of each metric
  const uniqueMetrics = [];
  const seenMetrics = new Set();
  
  for (const metric of metrics) {
    const key = `${metric.name}-${metric.value}`;
    if (!seenMetrics.has(key)) {
      seenMetrics.add(key);
      uniqueMetrics.push(metric);
    } else {
      console.log(`Duplicate metric removed: ${metric.name}: ${metric.value} ${metric.unit}`);
    }
  }
  
  console.log(`Extracted ${uniqueMetrics.length} unique metrics:`, uniqueMetrics);
  return uniqueMetrics;
}

function getMetricStatus(value: number, ranges: { min: number; max: number }): 'normal' | 'abnormal' | 'critical' {
  const { min, max } = ranges;
  
  // More reasonable thresholds
  if (value >= min && value <= max) {
    return 'normal';
  }
  
  // Calculate how far outside normal range
  let deviation = 0;
  if (value < min) {
    deviation = (min - value) / min;
  } else if (value > max) {
    deviation = (value - max) / max;
  }
  
  // More lenient thresholds
  if (deviation <= 0.1) return 'normal';      // Within 10% of normal range
  if (deviation <= 0.3) return 'abnormal';    // 10-30% outside normal range
  return 'critical';                          // More than 30% outside normal range
}

export function calculateHealthScore(metrics: HealthMetric[]): HealthScore {
  if (metrics.length === 0) {
    return {
      overall: 0,
      cardiovascular: 0,
      metabolic: 0,
      liver: 0,
      kidney: 0,
      trend: 'stable',
      lastUpdated: new Date()
    };
  }

  const categories = {
    cardiovascular: ['Heart Rate', 'Blood Pressure', 'Cholesterol', 'HDL', 'LDL', 'Triglycerides'],
    metabolic: ['Glucose', 'HbA1c', 'Insulin'],
    liver: ['ALT', 'AST', 'Bilirubin', 'ALP'],
    kidney: ['Creatinine', 'BUN', 'eGFR']
  };

  const scores: { [key: string]: number } = {};

  for (const [category, metricNames] of Object.entries(categories)) {
    const categoryMetrics = metrics.filter(m => 
      metricNames.some(name => m.name.includes(name))
    );
    
    if (categoryMetrics.length === 0) {
      scores[category] = 0;
      continue;
    }

    const categoryScore = categoryMetrics.reduce((sum, metric) => {
      const { value, normalRange, status } = metric;
      const { min, max } = normalRange;
      
      // More reasonable scoring based on status
      let score = 100;
      
      if (status === 'normal') {
        score = 100;
      } else if (status === 'abnormal') {
        // Mild penalty for abnormal values
        if (value < min) {
          const deviation = (min - value) / min;
          score = Math.max(70, 100 - (deviation * 30));
        } else if (value > max) {
          const deviation = (value - max) / max;
          score = Math.max(70, 100 - (deviation * 30));
        }
      } else if (status === 'critical') {
        // Higher penalty for critical values
        if (value < min) {
          const deviation = (min - value) / min;
          score = Math.max(30, 100 - (deviation * 70));
        } else if (value > max) {
          const deviation = (value - max) / max;
          score = Math.max(30, 100 - (deviation * 70));
        }
      }
      
      console.log(`${metric.name}: ${value} (${status}) -> Score: ${score}`);
      return sum + score;
    }, 0) / categoryMetrics.length;

    scores[category] = Math.round(categoryScore);
  }

  const overall = Math.round(
    Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length
  );

  console.log('Final scores:', scores);
  console.log('Overall score:', overall);

  return {
    overall,
    cardiovascular: scores.cardiovascular,
    metabolic: scores.metabolic,
    liver: scores.liver,
    kidney: scores.kidney,
    trend: 'stable', // Will be calculated when comparing with previous reports
    lastUpdated: new Date()
  };
}

export function generateInsights(metrics: HealthMetric[]): ReportInsight[] {
  const insights: ReportInsight[] = [];
  
  // Check for critical values
  const criticalMetrics = metrics.filter(m => m.status === 'critical');
  if (criticalMetrics.length > 0) {
    const criticalInsights = criticalMetrics.map(m => {
      const { value, normalRange } = m;
      const range = `${normalRange.min}-${normalRange.max} ${m.unit}`;
      const deviation = value > normalRange.max 
        ? Math.round(((value - normalRange.max) / normalRange.max) * 100)
        : Math.round(((normalRange.min - value) / normalRange.min) * 100);
      
      let severity = '';
      let urgency = '';
      let action = '';
      
      if (m.name.includes('Blood Pressure')) {
        if (m.name.includes('Systolic')) {
          if (value >= 180) {
            severity = 'Hypertensive Crisis';
            urgency = 'EMERGENCY - Call 911 immediately';
            action = 'This is a medical emergency requiring immediate treatment.';
          } else if (value >= 160) {
            severity = 'Stage 2 Hypertension';
            urgency = 'URGENT - See doctor within 24 hours';
            action = 'This requires immediate medical attention and likely medication.';
          }
        } else if (m.name.includes('Diastolic')) {
          if (value >= 120) {
            severity = 'Hypertensive Crisis';
            urgency = 'EMERGENCY - Call 911 immediately';
            action = 'This is a medical emergency requiring immediate treatment.';
          } else if (value >= 100) {
            severity = 'Stage 2 Hypertension';
            urgency = 'URGENT - See doctor within 24 hours';
            action = 'This requires immediate medical attention and likely medication.';
          }
        }
      } else if (m.name.includes('Glucose')) {
        if (value >= 300) {
          severity = 'Severe Hyperglycemia';
          urgency = 'EMERGENCY - Call 911 immediately';
          action = 'This is a medical emergency that can lead to diabetic coma.';
        } else if (value >= 200) {
          severity = 'Hyperglycemia';
          urgency = 'URGENT - See doctor within 24 hours';
          action = 'This indicates uncontrolled diabetes requiring immediate attention.';
        }
      } else if (m.name.includes('Heart Rate')) {
        if (value >= 150) {
          severity = 'Severe Tachycardia';
          urgency = 'URGENT - See doctor immediately';
          action = 'This heart rate is dangerously high and requires immediate evaluation.';
        } else if (value <= 40) {
          severity = 'Severe Bradycardia';
          urgency = 'URGENT - See doctor immediately';
          action = 'This heart rate is dangerously low and requires immediate evaluation.';
        }
      } else {
        severity = 'Critical Level';
        urgency = 'URGENT - See doctor within 24 hours';
        action = 'This value is significantly outside normal range and requires immediate attention.';
      }
      
      return {
        metric: `${m.name}: ${value} ${m.unit}`,
        normal: `Normal range: ${range}`,
        deviation: `${deviation}% outside normal range`,
        severity,
        urgency,
        action
      };
    });
    
    // Create detailed insight for each critical metric
    criticalInsights.forEach(insight => {
      insights.push({
        type: 'concern',
        title: `${insight.severity} - ${insight.metric}`,
        description: `${insight.normal} | ${insight.deviation} | ${insight.action}`,
        severity: 'high',
        recommendation: insight.urgency,
        relatedMetrics: [criticalMetrics.find(m => insight.metric.includes(m.name))?.name || '']
      });
    });
  }

  // Check for abnormal values
  const abnormalMetrics = metrics.filter(m => m.status === 'abnormal');
  if (abnormalMetrics.length > 0) {
    const abnormalList = abnormalMetrics.map(m => `${m.name}: ${m.value} ${m.unit}`).join(', ');
    insights.push({
      type: 'concern',
      title: 'Abnormal Values Found',
      description: `${abnormalMetrics.length} metric(s) are outside normal range: ${abnormalList}`,
      severity: 'medium',
      recommendation: 'Consider discussing these results with your healthcare provider.',
      relatedMetrics: abnormalMetrics.map(m => m.name)
    });
  }

  // Check for all normal values
  const normalMetrics = metrics.filter(m => m.status === 'normal');
  if (normalMetrics.length === metrics.length && metrics.length > 0) {
    insights.push({
      type: 'stable',
      title: 'All Values Normal',
      description: 'All detected metrics are within normal ranges.',
      severity: 'low',
      relatedMetrics: normalMetrics.map(m => m.name)
    });
  }

  return insights;
}

export function compareReports(currentMetrics: HealthMetric[], previousMetrics: HealthMetric[]): ReportComparison {
  const currentMap = new Map(currentMetrics.map(m => [m.name, m]));
  const previousMap = new Map(previousMetrics.map(m => [m.name, m]));
  
  const changes = {
    improved: [] as string[],
    worsened: [] as string[],
    new: [] as string[],
    resolved: [] as string[]
  };

  // Check for improvements and worsening
  for (const [name, current] of Array.from(currentMap.entries())) {
    const previous = previousMap.get(name);
    if (previous) {
      if (current.status === 'normal' && previous.status !== 'normal') {
        changes.improved.push(name);
      } else if (current.status !== 'normal' && previous.status === 'normal') {
        changes.worsened.push(name);
      }
    } else {
      changes.new.push(name);
    }
  }

  // Check for resolved issues
  for (const [name, previous] of Array.from(previousMap.entries())) {
    if (!currentMap.has(name)) {
      changes.resolved.push(name);
    }
  }

  // Determine overall trend
  let overallTrend: 'improving' | 'stable' | 'declining' = 'stable';
  const improvementCount = changes.improved.length + changes.resolved.length;
  const worseningCount = changes.worsened.length + changes.new.filter(name => 
    currentMap.get(name)?.status !== 'normal'
  ).length;

  if (improvementCount > worseningCount) {
    overallTrend = 'improving';
  } else if (worseningCount > improvementCount) {
    overallTrend = 'declining';
  }

  return {
    current: 'Current Report',
    previous: 'Previous Report',
    changes,
    overallTrend
  };
}

export function getHealthTrendDescription(score: HealthScore): string {
  if (score.overall >= 90) {
    return 'Excellent health indicators across all categories.';
  } else if (score.overall >= 80) {
    return 'Good health indicators with minor areas for improvement.';
  } else if (score.overall >= 70) {
    return 'Fair health indicators with some areas needing attention.';
  } else if (score.overall >= 60) {
    return 'Below average health indicators requiring medical attention.';
  } else {
    return 'Poor health indicators requiring immediate medical consultation.';
  }
}

export function getCategoryDescription(category: keyof Omit<HealthScore, 'overall' | 'trend' | 'lastUpdated'>, score: number): string {
  const descriptions = {
    cardiovascular: {
      excellent: 'Your cardiovascular health is excellent with optimal heart and blood vessel function.',
      good: 'Your cardiovascular health is good with minor areas for improvement.',
      fair: 'Your cardiovascular health shows some concerns that should be monitored.',
      poor: 'Your cardiovascular health requires immediate attention and medical consultation.'
    },
    metabolic: {
      excellent: 'Your metabolic health is excellent with optimal glucose and insulin function.',
      good: 'Your metabolic health is good with minor areas for improvement.',
      fair: 'Your metabolic health shows some concerns that should be monitored.',
      poor: 'Your metabolic health requires immediate attention and medical consultation.'
    },
    liver: {
      excellent: 'Your liver function is excellent with optimal enzyme levels.',
      good: 'Your liver function is good with minor areas for improvement.',
      fair: 'Your liver function shows some concerns that should be monitored.',
      poor: 'Your liver function requires immediate attention and medical consultation.'
    },
    kidney: {
      excellent: 'Your kidney function is excellent with optimal filtration rates.',
      good: 'Your kidney function is good with minor areas for improvement.',
      fair: 'Your kidney function shows some concerns that should be monitored.',
      poor: 'Your kidney function requires immediate attention and medical consultation.'
    }
  };

  const categoryDesc = descriptions[category];
  if (score >= 90) return categoryDesc.excellent;
  if (score >= 80) return categoryDesc.good;
  if (score >= 70) return categoryDesc.fair;
  return categoryDesc.poor;
}
