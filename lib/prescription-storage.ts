export interface PrescriptionRecord {
  id: string;
  reportData: string;
  summary: string;
  uploadedAt: Date;
  fileName: string;
}

class PrescriptionStorage {
  private readonly STORAGE_KEY = 'medscan_prescriptions';

  // Save prescription to localStorage
  savePrescription(reportData: string, summary: string, fileName: string): void {
    const prescriptions = this.getAllPrescriptions();
    
    const newPrescription: PrescriptionRecord = {
      id: this.generateId(),
      reportData,
      summary,
      uploadedAt: new Date(),
      fileName
    };

    prescriptions.unshift(newPrescription); // Add to beginning of array
    
    // Keep only last 50 prescriptions to prevent storage overflow
    if (prescriptions.length > 50) {
      prescriptions.splice(50);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(prescriptions));
  }

  // Get all prescriptions
  getAllPrescriptions(): PrescriptionRecord[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const prescriptions = JSON.parse(stored);
      // Convert string dates back to Date objects
      return prescriptions.map((p: any) => ({
        ...p,
        uploadedAt: new Date(p.uploadedAt)
      }));
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      return [];
    }
  }

  // Get prescription by ID
  getPrescriptionById(id: string): PrescriptionRecord | null {
    const prescriptions = this.getAllPrescriptions();
    return prescriptions.find(p => p.id === id) || null;
  }

  // Delete prescription by ID
  deletePrescription(id: string): void {
    const prescriptions = this.getAllPrescriptions();
    const filtered = prescriptions.filter(p => p.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  // Clear all prescriptions
  clearAllPrescriptions(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Format date for display
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  // Get prescriptions count
  getPrescriptionsCount(): number {
    return this.getAllPrescriptions().length;
  }
}

export const prescriptionStorage = new PrescriptionStorage();
