"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { 
  FileText, 
  Activity, 
  Heart, 
  Droplet, 
  Brain, 
  Eye, 
  Bone, 
  Stethoscope,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';
import { PrescriptionRecord } from '@/lib/prescription-storage';

export type ReportCategory = 
  | 'Blood Test'
  | 'Lipid Panel'
  | 'Liver Function'
  | 'Kidney Function'
  | 'Thyroid'
  | 'Diabetes'
  | 'X-Ray'
  | 'MRI'
  | 'CT Scan'
  | 'Ultrasound'
  | 'ECG'
  | 'Urine Test'
  | 'Complete Blood Count'
  | 'Other';

export interface ReportTemplate {
  id: string;
  name: string;
  category: ReportCategory;
  fields: TemplateField[];
  icon: React.ElementType;
  color: string;
}

export interface TemplateField {
  name: string;
  unit: string;
  normalRange?: { min: number; max: number };
  required: boolean;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'lipid-panel',
    name: 'Lipid Panel',
    category: 'Lipid Panel',
    icon: Heart,
    color: 'from-red-500 to-pink-500',
    fields: [
      { name: 'Total Cholesterol', unit: 'mg/dL', normalRange: { min: 0, max: 200 }, required: true },
      { name: 'HDL', unit: 'mg/dL', normalRange: { min: 40, max: 200 }, required: true },
      { name: 'LDL', unit: 'mg/dL', normalRange: { min: 0, max: 100 }, required: true },
      { name: 'Triglycerides', unit: 'mg/dL', normalRange: { min: 0, max: 150 }, required: true },
      { name: 'VLDL', unit: 'mg/dL', normalRange: { min: 0, max: 30 }, required: false },
    ]
  },
  {
    id: 'cbc',
    name: 'Complete Blood Count (CBC)',
    category: 'Complete Blood Count',
    icon: Droplet,
    color: 'from-red-600 to-red-400',
    fields: [
      { name: 'Hemoglobin', unit: 'g/dL', normalRange: { min: 12, max: 16 }, required: true },
      { name: 'RBC Count', unit: 'million/μL', normalRange: { min: 4.5, max: 5.5 }, required: true },
      { name: 'WBC Count', unit: 'thousand/μL', normalRange: { min: 4, max: 11 }, required: true },
      { name: 'Platelets', unit: 'thousand/μL', normalRange: { min: 150, max: 400 }, required: true },
      { name: 'Hematocrit', unit: '%', normalRange: { min: 36, max: 46 }, required: false },
    ]
  },
  {
    id: 'diabetes',
    name: 'Diabetes Panel',
    category: 'Diabetes',
    icon: Activity,
    color: 'from-blue-500 to-cyan-500',
    fields: [
      { name: 'Fasting Glucose', unit: 'mg/dL', normalRange: { min: 70, max: 100 }, required: true },
      { name: 'HbA1c', unit: '%', normalRange: { min: 4, max: 5.7 }, required: true },
      { name: 'Postprandial Glucose', unit: 'mg/dL', normalRange: { min: 70, max: 140 }, required: false },
      { name: 'Random Blood Sugar', unit: 'mg/dL', normalRange: { min: 70, max: 125 }, required: false },
    ]
  },
  {
    id: 'liver',
    name: 'Liver Function Test (LFT)',
    category: 'Liver Function',
    icon: Stethoscope,
    color: 'from-amber-500 to-orange-500',
    fields: [
      { name: 'SGOT', unit: 'U/L', normalRange: { min: 0, max: 40 }, required: true },
      { name: 'SGPT', unit: 'U/L', normalRange: { min: 0, max: 41 }, required: true },
      { name: 'Bilirubin Total', unit: 'mg/dL', normalRange: { min: 0.1, max: 1.2 }, required: true },
      { name: 'Alkaline Phosphatase', unit: 'U/L', normalRange: { min: 44, max: 147 }, required: false },
    ]
  },
  {
    id: 'kidney',
    name: 'Kidney Function Test (KFT)',
    category: 'Kidney Function',
    icon: Droplet,
    color: 'from-teal-500 to-emerald-500',
    fields: [
      { name: 'Creatinine', unit: 'mg/dL', normalRange: { min: 0.7, max: 1.3 }, required: true },
      { name: 'BUN', unit: 'mg/dL', normalRange: { min: 7, max: 20 }, required: true },
      { name: 'Uric Acid', unit: 'mg/dL', normalRange: { min: 3.5, max: 7.2 }, required: false },
      { name: 'eGFR', unit: 'mL/min', normalRange: { min: 90, max: 120 }, required: false },
    ]
  },
  {
    id: 'thyroid',
    name: 'Thyroid Function Test',
    category: 'Thyroid',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    fields: [
      { name: 'TSH', unit: 'μIU/mL', normalRange: { min: 0.4, max: 4.0 }, required: true },
      { name: 'T3', unit: 'ng/dL', normalRange: { min: 80, max: 200 }, required: false },
      { name: 'T4', unit: 'μg/dL', normalRange: { min: 5.0, max: 12.0 }, required: false },
      { name: 'Free T4', unit: 'ng/dL', normalRange: { min: 0.8, max: 1.8 }, required: false },
    ]
  }
];

interface ReportCategoriesProps {
  onSelectTemplate: (template: ReportTemplate) => void;
  onCreateCustom: () => void;
}

export const ReportCategories: React.FC<ReportCategoriesProps> = ({ 
  onSelectTemplate,
  onCreateCustom
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'All'>('All');

  const categories: (ReportCategory | 'All')[] = [
    'All',
    'Blood Test',
    'Lipid Panel',
    'Diabetes',
    'Liver Function',
    'Kidney Function',
    'Thyroid',
    'X-Ray',
    'MRI',
    'CT Scan',
    'Ultrasound',
    'ECG',
    'Other'
  ];

  const filteredTemplates = selectedCategory === 'All'
    ? reportTemplates
    : reportTemplates.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">Report Templates</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Select a template to quickly extract and organize test results
          </p>
        </div>
        <button
          onClick={onCreateCustom}
          className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          Custom Template
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template, index) => {
          const Icon = template.icon;
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                onClick={() => onSelectTemplate(template)}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {template.fields.length} fields
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                    {template.name}
                  </h3>

                  <div className="space-y-1.5">
                    {template.fields.slice(0, 3).map((field, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600 dark:text-gray-400">{field.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">{field.unit}</span>
                      </div>
                    ))}
                    {template.fields.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                        +{template.fields.length - 3} more fields
                      </div>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTemplate(template);
                    }}
                    className="w-full mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    Use Template
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No templates in this category
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Select a different category or create a custom template
          </p>
        </div>
      )}
    </div>
  );
};

// Export templates for use in other components
export { reportTemplates };
