export interface PrescriptionRecord {
  id: string;
  reportData: string;
  summary: string;
  uploadedAt: Date;
  fileName: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  extractedData?: any;
  category?: string;
}

class PrescriptionStorage {
  private readonly STORAGE_KEY = 'alephra_prescriptions';
  private cache: PrescriptionRecord[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds cache
  private pendingRequest: Promise<PrescriptionRecord[]> | null = null;

  // Save prescription (with server sync if user is logged in)
  async savePrescription(
    reportData: string, 
    summary: string, 
    fileName: string,
    fileUrl?: string,
    fileType?: string,
    fileSize?: number,
    extractedData?: any
  ): Promise<PrescriptionRecord | null> {
    const newPrescription: PrescriptionRecord = {
      id: this.generateId(),
      reportData,
      summary,
      uploadedAt: new Date(),
      fileName,
      fileUrl,
      fileType,
      fileSize,
      extractedData,
      category: 'General'
    };

    // Try to save to server first
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileUrl,
          fileType,
          fileSize,
          reportText: reportData,
          summary,
          extractedData,
          reportDate: new Date().toISOString(),
          category: 'General'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const isDev = process.env.NODE_ENV !== 'production';
        if (isDev) console.log('Report saved to server:', data.report.id);
        
        // Invalidate cache to force fresh fetch
        this.invalidateCache();
        
        // Update local storage with server ID
        newPrescription.id = data.report.id;
        this.saveToLocalStorage(newPrescription);
        return newPrescription;
      } else {
        // Server failed, save locally
        console.warn('Server save failed, using localStorage');
        this.saveToLocalStorage(newPrescription);
        return newPrescription;
      }
    } catch (error) {
      // Network error, save locally
      console.error('Network error, saving locally:', error);
      this.saveToLocalStorage(newPrescription);
      return newPrescription;
    }
  }

  // Save to localStorage only
  private saveToLocalStorage(prescription: PrescriptionRecord): void {
    const prescriptions = this.getAllPrescriptionsLocal();
    prescriptions.unshift(prescription);
    
    // Keep only last 50 prescriptions
    if (prescriptions.length > 50) {
      prescriptions.splice(50);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(prescriptions));
  }

  // Get all prescriptions from localStorage
  private getAllPrescriptionsLocal(): PrescriptionRecord[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const prescriptions = JSON.parse(stored);
      return prescriptions.map((p: any) => ({
        ...p,
        uploadedAt: new Date(p.uploadedAt)
      }));
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      return [];
    }
  }

  // Get all prescriptions (server + localStorage hybrid with caching)
  async getAllPrescriptions(): Promise<PrescriptionRecord[]> {
    // Check if cache is valid (less than 30 seconds old)
    const now = Date.now();
    if (this.cache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cache;
    }

    // If there's already a pending request, wait for it instead of making a new one
    if (this.pendingRequest) {
      return this.pendingRequest;
    }

    // Create new request
    this.pendingRequest = this.fetchPrescriptions();
    
    try {
      const result = await this.pendingRequest;
      return result;
    } finally {
      this.pendingRequest = null;
    }
  }

  private async fetchPrescriptions(): Promise<PrescriptionRecord[]> {
    try {
      // Try to fetch from server
      const response = await fetch('/api/reports');
      
      if (response.ok) {
        const data = await response.json();
        const serverReports = data.reports.map((r: any) => ({
          id: r.id,
          reportData: r.reportText,
          summary: r.summary || r.reportText.substring(0, 250) + '...',
          uploadedAt: new Date(r.uploadDate),
          fileName: r.fileName,
          fileUrl: r.fileUrl,
          fileType: r.fileType,
          fileSize: r.fileSize,
          extractedData: r.extractedData,
          category: r.category,
        }));
        
        // Update cache
        this.cache = serverReports;
        this.cacheTimestamp = Date.now();
        
        // Also cache to localStorage
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serverReports));
        return serverReports;
      } else if (response.status === 401) {
        // User is not authenticated - return empty array and clear cache
        this.cache = [];
        this.cacheTimestamp = Date.now();
        localStorage.removeItem(this.STORAGE_KEY);
        return [];
      } else {
        // Server error - use localStorage as fallback
        const localData = this.getAllPrescriptionsLocal();
        this.cache = localData;
        this.cacheTimestamp = Date.now();
        return localData;
      }
    } catch (error) {
      // Network error, use localStorage
      console.error('Failed to fetch from server, using localStorage:', error);
      const localData = this.getAllPrescriptionsLocal();
      this.cache = localData;
      this.cacheTimestamp = Date.now();
      return localData;
    }
  }

  // Invalidate cache (call this after creating/deleting reports)
  invalidateCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) console.log('🗑️ Cache invalidated');
  }

  // Get prescription by ID
  async getPrescriptionById(id: string): Promise<PrescriptionRecord | null> {
    const prescriptions = await this.getAllPrescriptions();
    return prescriptions.find(p => p.id === id) || null;
  }

  // Delete prescription
  async deletePrescription(id: string): Promise<void> {
    try {
      // Try to delete from server
      const response = await fetch(`/api/reports?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const isDev = process.env.NODE_ENV !== 'production';
        if (isDev) console.log('Report deleted from server');
        // Invalidate cache to force fresh fetch
        this.invalidateCache();
      }
    } catch (error) {
      console.error('Failed to delete from server:', error);
    }

    // Always delete from localStorage too
    const prescriptions = this.getAllPrescriptionsLocal();
    const filtered = prescriptions.filter(p => p.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  // Clear all prescriptions
  clearAllPrescriptions(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.invalidateCache();
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
  async getPrescriptionsCount(): Promise<number> {
    const prescriptions = await this.getAllPrescriptions();
    return prescriptions.length;
  }
}

export const prescriptionStorage = new PrescriptionStorage();

