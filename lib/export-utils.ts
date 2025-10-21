/**
 * Export Utilities for Healthcare Data
 * Supports PDF and CSV export for medical reports and analytics
 */

// CSV Export Functions
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle nested objects
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        // Escape quotes in strings
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
}

export function exportVitalsToCSV(vitals: any[]) {
  const formattedData = vitals.map(v => ({
    Date: v.date || v.time,
    'Heart Rate (bpm)': v.hr,
    'SpO2 (%)': v.spo2,
    'Systolic BP': v.bp?.systolic || 'N/A',
    'Diastolic BP': v.bp?.diastolic || 'N/A',
    'Weight (kg)': v.weight || 'N/A',
    'Temperature (°F)': v.temperature || 'N/A'
  }));
  
  exportToCSV(formattedData, `vitals-data-${new Date().toISOString().split('T')[0]}.csv`);
}

export function exportLabsToCSV(labs: any[]) {
  const formattedData = labs.map(lab => ({
    Date: lab.date,
    'Test Name': lab.name,
    Value: lab.value,
    Unit: lab.unit,
    'Normal Range': `${lab.normalRange?.min || 0} - ${lab.normalRange?.max || 0}`,
    Category: lab.category,
    Status: isLabNormal(lab) ? 'Normal' : 'Abnormal'
  }));
  
  exportToCSV(formattedData, `lab-results-${new Date().toISOString().split('T')[0]}.csv`);
}

export function exportRemindersToCSV(reminders: any[]) {
  const formattedData = reminders.map(r => ({
    Title: r.title,
    Description: r.description || 'N/A',
    'Reminder Time': r.reminderTime,
    'Google Event': r.googleEventId ? 'Yes' : 'No',
    'Created Date': new Date().toISOString().split('T')[0]
  }));
  
  exportToCSV(formattedData, `reminders-${new Date().toISOString().split('T')[0]}.csv`);
}

export function exportAppointmentsToCSV(appointments: any[]) {
  const formattedData = appointments.map(apt => ({
    Title: apt.title,
    Date: apt.date,
    Time: apt.time,
    Location: apt.location || 'N/A',
    Notes: apt.notes || 'N/A'
  }));
  
  exportToCSV(formattedData, `appointments-${new Date().toISOString().split('T')[0]}.csv`);
}

// PDF Export (uses browser print with special formatting)
export function exportToPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for PDF export');
    return;
  }

  // Create a print-friendly view
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  const styles = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 40px;
        color: #000;
        background: #fff;
      }
      h1 { font-size: 24px; margin-bottom: 20px; color: #000; }
      h2 { font-size: 18px; margin-top: 30px; margin-bottom: 15px; color: #333; }
      h3 { font-size: 16px; margin-top: 20px; margin-bottom: 10px; color: #444; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background: #f5f5f5; font-weight: 600; }
      .header { 
        display: flex; 
        justify-content: space-between; 
        align-items: center;
        border-bottom: 3px solid #000;
        padding-bottom: 20px;
        margin-bottom: 30px;
      }
      .logo { font-size: 28px; font-weight: 700; }
      .date { color: #666; font-size: 14px; }
      .metric { margin: 15px 0; }
      .metric-label { font-weight: 600; color: #666; font-size: 14px; }
      .metric-value { font-size: 20px; font-weight: 700; margin-top: 5px; }
      .status-normal { color: #10b981; }
      .status-warning { color: #f59e0b; }
      .status-critical { color: #ef4444; }
      .footer {
        margin-top: 50px;
        padding-top: 20px;
        border-top: 2px solid #ddd;
        text-align: center;
        color: #666;
        font-size: 12px;
      }
      @media print {
        body { padding: 20px; }
        .no-print { display: none; }
      }
    </style>
  `;

  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      ${styles}
    </head>
    <body>
      <div class="header">
        <div class="logo">MedScan Health Report</div>
        <div class="date">${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</div>
      </div>
      ${element.innerHTML}
      <div class="footer">
        <p>This report was generated by MedScan - AI-Powered Health Analytics</p>
        <p>© ${new Date().getFullYear()} MedScan. All rights reserved.</p>
      </div>
      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
}

// Helper function to download files
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper to check if lab value is normal
function isLabNormal(lab: any): boolean {
  if (!lab.normalRange) return true;
  return lab.value >= lab.normalRange.min && lab.value <= lab.normalRange.max;
}

// Helper function for safe base64 encoding (handles Unicode)
function base64EncodeUnicode(str: string): string {
  // First encode the string as UTF-8, then convert to base64
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
}

// Helper function for safe base64 decoding (handles Unicode)
export function base64DecodeUnicode(str: string): string {
  // Decode base64, then decode UTF-8
  return decodeURIComponent(Array.prototype.map.call(atob(str), (c: string) => {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

// Generate shareable link
export async function generateShareableLink(data: any, expiresIn: number = 7): Promise<string> {
  try {
    // Clean the data to remove any circular references or non-serializable data
    const cleanData = {
      vitals: (data.vitals || []).map((v: any) => ({
        time: v.time || v.date,
        hr: v.hr,
        spo2: v.spo2,
        date: v.date
      })),
      labs: (data.labs || []).map((l: any) => ({
        name: l.name,
        value: l.value,
        unit: l.unit,
        date: l.date,
        normalRange: l.normalRange,
        category: l.category
      })),
      healthScore: data.healthScore || 0,
      generatedAt: data.generatedAt || new Date().toISOString()
    };
    
    const payload = {
      data: cleanData,
      expiresAt: Date.now() + (expiresIn * 24 * 60 * 60 * 1000),
      createdAt: Date.now()
    };
    
    // Use safe encoding that handles Unicode
    const jsonString = JSON.stringify(payload);
    const encoded = base64EncodeUnicode(jsonString);
    const shareUrl = `${window.location.origin}/shared/${encoded}`;
    
    // Copy to clipboard
    await navigator.clipboard.writeText(shareUrl);
    return shareUrl;
  } catch (err) {
    console.error('Failed to generate shareable link:', err);
    throw new Error('Failed to generate shareable link. Please try again.');
  }
}

// Export comprehensive health summary
export function exportHealthSummary(vitals: any[], labs: any[], medications: any[]) {
  const summary = {
    'Report Date': new Date().toISOString().split('T')[0],
    'Vitals Summary': {
      'Latest Heart Rate': vitals[vitals.length - 1]?.hr || 'N/A',
      'Latest SpO2': vitals[vitals.length - 1]?.spo2 || 'N/A',
      'Latest BP': vitals[vitals.length - 1]?.bp ? 
        `${vitals[vitals.length - 1].bp.systolic}/${vitals[vitals.length - 1].bp.diastolic}` : 'N/A',
      'Average Heart Rate (7 days)': vitals.length > 0 ? 
        Math.round(vitals.slice(-7).reduce((sum, v) => sum + v.hr, 0) / Math.min(7, vitals.length)) : 'N/A'
    },
    'Lab Summary': {
      'Total Tests': labs.length,
      'Abnormal Results': labs.filter(lab => !isLabNormal(lab)).length,
      'Latest Test Date': labs[labs.length - 1]?.date || 'N/A'
    },
    'Medications': medications.map(med => `${med.name} ${med.dose} ${med.freq}`).join('; ')
  };
  
  // Flatten object for CSV
  const flattened = Object.entries(summary).flatMap(([key, value]) => {
    if (typeof value === 'object' && !Array.isArray(value)) {
      return Object.entries(value).map(([subKey, subValue]) => ({
        Section: key,
        Metric: subKey,
        Value: subValue
      }));
    }
    return [{ Section: key, Metric: '', Value: value }];
  });
  
  exportToCSV(flattened, `health-summary-${new Date().toISOString().split('T')[0]}.csv`);
}
