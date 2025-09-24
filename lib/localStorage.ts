/**
 * Safe localStorage utilities with proper error handling and user notifications
 */

interface StorageError {
  operation: 'get' | 'set' | 'remove';
  key: string;
  error: Error;
  data?: any;
}

// Global error handler for localStorage failures
const handleStorageError = (error: StorageError) => {
  console.error(`localStorage ${error.operation} failed for key "${error.key}":`, error.error);
  
  // You can integrate with your toast notification system here
  // For now, we'll use console.warn as a fallback
  const message = error.operation === 'get' 
    ? `Failed to load ${error.key} data. Using default values.`
    : `Failed to save ${error.key} data. Changes may not persist.`;
  
  console.warn(message);
  
  // In a real app, you might want to:
  // 1. Show a toast notification to the user
  // 2. Send error to monitoring service
  // 3. Implement retry logic
  // 4. Fallback to alternative storage (IndexedDB, etc.)
};

/**
 * Safely get data from localStorage with fallback
 */
export const safeGetItem = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return fallback;
    return JSON.parse(item);
  } catch (error) {
    handleStorageError({
      operation: 'get',
      key,
      error: error as Error
    });
    return fallback;
  }
};

/**
 * Safely set data to localStorage with error handling
 */
export const safeSetItem = <T>(key: string, data: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    handleStorageError({
      operation: 'set',
      key,
      error: error as Error,
      data
    });
    return false;
  }
};

/**
 * Safely remove data from localStorage
 */
export const safeRemoveItem = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    handleStorageError({
      operation: 'remove',
      key,
      error: error as Error
    });
    return false;
  }
};

/**
 * Check if localStorage is available and working
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get storage quota usage (if supported)
 */
export const getStorageUsage = (): { used: number; available: number } | null => {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return navigator.storage.estimate().then(estimate => ({
        used: estimate.usage || 0,
        available: estimate.quota || 0
      })) as any;
    }
  } catch {
    // Ignore errors
  }
  return null;
};

/**
 * Clear all MedScan data from localStorage
 */
export const clearAllMedScanData = (): boolean => {
  const keys = [
    'medscan.vitals',
    'medscan.labs', 
    'medscan.reminders',
    'medscan.cart',
    'medscan.appointments'
  ];
  
  let allSuccessful = true;
  keys.forEach(key => {
    if (!safeRemoveItem(key)) {
      allSuccessful = false;
    }
  });
  
  return allSuccessful;
};
