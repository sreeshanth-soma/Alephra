/**
 * Dashboard Data Sync Utilities
 * Handles syncing data between localStorage and database for cross-device access
 */

import { safeGetItem, safeSetItem, safeRemoveItem } from "./localStorage";

// API helpers
async function fetchAPI(endpoint: string, options?: RequestInit) {
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  
  return res.json();
}

// Vitals sync
export async function syncVitalsToServer(vitals: any[]) {
  try {
    for (const vital of vitals) {
      await fetchAPI('/api/vitals', {
        method: 'POST',
        body: JSON.stringify(vital),
      });
    }
    return true;
  } catch (error) {
    console.error('Failed to sync vitals to server:', error);
    return false;
  }
}

export async function loadVitalsFromServer(): Promise<any[]> {
  try {
    const data = await fetchAPI('/api/vitals');
    return data.vitals || [];
  } catch (error) {
    console.error('Failed to load vitals from server:', error);
    return [];
  }
}

export async function saveVitalToServer(vital: any) {
  try {
    const data = await fetchAPI('/api/vitals', {
      method: 'POST',
      body: JSON.stringify(vital),
    });
    return data.vital;
  } catch (error) {
    console.error('Failed to save vital to server:', error);
    throw error;
  }
}

// Labs sync
export async function syncLabsToServer(labs: any[]) {
  try {
    for (const lab of labs) {
      await fetchAPI('/api/labs', {
        method: 'POST',
        body: JSON.stringify(lab),
      });
    }
    return true;
  } catch (error) {
    console.error('Failed to sync labs to server:', error);
    return false;
  }
}

export async function loadLabsFromServer(): Promise<any[]> {
  try {
    const data = await fetchAPI('/api/labs');
    return data.labs || [];
  } catch (error) {
    console.error('Failed to load labs from server:', error);
    return [];
  }
}

export async function saveLabToServer(lab: any) {
  try {
    const data = await fetchAPI('/api/labs', {
      method: 'POST',
      body: JSON.stringify(lab),
    });
    return data.lab;
  } catch (error) {
    console.error('Failed to save lab to server:', error);
    throw error;
  }
}

export async function deleteLabFromServer(id: string) {
  try {
    await fetchAPI(`/api/labs?id=${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error('Failed to delete lab from server:', error);
    return false;
  }
}

// Migration helper - one-time sync from localStorage to database
export async function migrateLocalDataToServer(userEmail: string): Promise<void> {
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) console.log('Starting data migration from localStorage to server...');
  
  try {
    // Migrate vitals
    const localVitals = JSON.parse(safeGetItem("vitals", "[]"));
    if (localVitals.length > 0) {
      if (isDev) console.log(`Migrating ${localVitals.length} vitals...`);
      for (const vital of localVitals) {
        await saveVitalToServer(vital);
      }
    }
    
    // Migrate labs
    const localLabs = JSON.parse(safeGetItem("labs", "[]"));
    if (localLabs.length > 0) {
      if (isDev) console.log(`Migrating ${localLabs.length} lab results...`);
      for (const lab of localLabs) {
        await saveLabToServer(lab);
      }
    }
    
    if (isDev) console.log('Migration complete!');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Check if user has migrated data
export function hasUserMigrated(): boolean {
  return safeGetItem('alephra.migrated', false);
}

export function markUserAsMigrated() {
  safeSetItem('alephra.migrated', true);
}

// Hybrid mode - use server if available, fallback to localStorage
export async function loadVitalsHybrid(userId?: string): Promise<any[]> {
  if (!userId) {
    // Not logged in, use localStorage
    return safeGetItem('alephra.vitals', []);
  }
  
  try {
    // Try to load from server
    const serverData = await loadVitalsFromServer();
    
    // If first time or empty, try migration
    if (serverData.length === 0 && !hasUserMigrated()) {
      const localData = safeGetItem('alephra.vitals', []);
      if (localData.length > 0) {
        await syncVitalsToServer(localData);
        markUserAsMigrated();
        return localData;
      }
    }
    
    return serverData;
  } catch (error) {
    console.error('Server unavailable, using localStorage:', error);
    return safeGetItem('alephra.vitals', []);
  }
}

export async function loadLabsHybrid(userId?: string): Promise<any[]> {
  if (!userId) {
    return safeGetItem('alephra.labs', []);
  }
  
  try {
    const serverData = await loadLabsFromServer();
    
    if (serverData.length === 0 && !hasUserMigrated()) {
      const localData = safeGetItem('alephra.labs', []);
      if (localData.length > 0) {
        await syncLabsToServer(localData);
        markUserAsMigrated();
        return localData;
      }
    }
    
    return serverData;
  } catch (error) {
    console.error('Server unavailable, using localStorage:', error);
    return safeGetItem('alephra.labs', []);
  }
}
