/**
 * Data Migration Utility
 * 
 * Detects existing localStorage data and migrates it to the backend API
 * on first successful login. This preserves user data during the transition
 * from localStorage-based mock data to real backend integration.
 */

export interface MigrationStatus {
  completed: boolean;
  timestamp?: string;
  migratedItems?: string[];
  errors?: string[];
}

const MIGRATION_KEY = 'hamro_saath_migration_status';

/**
 * Check if data migration has already been completed
 */
export const isMigrationComplete = (): boolean => {
  try {
    const status = localStorage.getItem(MIGRATION_KEY);
    if (!status) return false;
    
    const parsed: MigrationStatus = JSON.parse(status);
    return parsed.completed === true;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
};

/**
 * Mark migration as complete
 */
export const markMigrationComplete = (migratedItems: string[] = [], errors: string[] = []): void => {
  const status: MigrationStatus = {
    completed: true,
    timestamp: new Date().toISOString(),
    migratedItems,
    errors,
  };
  localStorage.setItem(MIGRATION_KEY, JSON.stringify(status));
};

/**
 * Get migration status details
 */
export const getMigrationStatus = (): MigrationStatus | null => {
  try {
    const status = localStorage.getItem(MIGRATION_KEY);
    if (!status) return null;
    return JSON.parse(status);
  } catch (error) {
    console.error('Error getting migration status:', error);
    return null;
  }
};

/**
 * Detect localStorage data that needs migration
 */
export const detectMigrationData = (): { key: string; size: number }[] => {
  const keysToMigrate: string[] = [
    'hamro_saath_user_activities',
    'hamro_saath_user_issues',
    'hamro_saath_user_recycling',
    'hamro_saath_user_events',
    'hamro_saath_user_forum_posts',
    'hamro_saath_user_badges',
    'hamro_saath_user_redemptions',
  ];

  const detectedData: { key: string; size: number }[] = [];

  keysToMigrate.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      detectedData.push({
        key,
        size: new Blob([data]).size,
      });
    }
  });

  return detectedData;
};

/**
 * Migrate user activities to backend
 * (Placeholder - will be implemented when backend endpoints are ready)
 */
export const migrateActivities = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const data = localStorage.getItem('hamro_saath_user_activities');
    if (!data) return { success: true };

    // Parse the data
    const activities = JSON.parse(data);
    
    // TODO: Send to backend when activity creation endpoint is ready
    // await apiClient.post('/api/v1/activities/bulk', { activities });
    
    console.log('Activities detected for migration:', activities.length);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Migrate user issues to backend
 * (Placeholder - will be implemented when backend endpoints are ready)
 */
export const migrateIssues = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const data = localStorage.getItem('hamro_saath_user_issues');
    if (!data) return { success: true };

    const issues = JSON.parse(data);
    
    // TODO: Send to backend when issue creation endpoint is ready
    // await apiClient.post('/api/v1/issues/bulk', { issues });
    
    console.log('Issues detected for migration:', issues.length);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Migrate recycling logs to backend
 * (Placeholder - will be implemented when backend endpoints are ready)
 */
export const migrateRecyclingLogs = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const data = localStorage.getItem('hamro_saath_user_recycling');
    if (!data) return { success: true };

    const logs = JSON.parse(data);
    
    // TODO: Send to backend when recycling log endpoint is ready
    // await apiClient.post('/api/v1/recycle-logs/bulk', { logs });
    
    console.log('Recycling logs detected for migration:', logs.length);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Main migration function - orchestrates all migrations
 */
export const performDataMigration = async (): Promise<MigrationStatus> => {
  console.log('[Migration] Starting data migration...');

  // Check if migration already completed
  if (isMigrationComplete()) {
    console.log('[Migration] Already completed');
    return getMigrationStatus()!;
  }

  // Detect data to migrate
  const detectedData = detectMigrationData();
  console.log('[Migration] Detected data:', detectedData);

  if (detectedData.length === 0) {
    console.log('[Migration] No data to migrate');
    markMigrationComplete();
    return { completed: true, migratedItems: [], errors: [] };
  }

  // Run migrations
  const migratedItems: string[] = [];
  const errors: string[] = [];

  // Migrate activities
  const activitiesResult = await migrateActivities();
  if (activitiesResult.success) {
    migratedItems.push('activities');
  } else {
    errors.push(`Activities: ${activitiesResult.error}`);
  }

  // Migrate issues
  const issuesResult = await migrateIssues();
  if (issuesResult.success) {
    migratedItems.push('issues');
  } else {
    errors.push(`Issues: ${issuesResult.error}`);
  }

  // Migrate recycling logs
  const recyclingResult = await migrateRecyclingLogs();
  if (recyclingResult.success) {
    migratedItems.push('recycling_logs');
  } else {
    errors.push(`Recycling: ${recyclingResult.error}`);
  }

  // Mark migration as complete
  markMigrationComplete(migratedItems, errors);

  console.log('[Migration] Completed', { migratedItems, errors });

  return {
    completed: true,
    timestamp: new Date().toISOString(),
    migratedItems,
    errors,
  };
};

/**
 * Reset migration status (for testing purposes)
 */
export const resetMigrationStatus = (): void => {
  localStorage.removeItem(MIGRATION_KEY);
  console.log('[Migration] Status reset');
};

/**
 * Get summary of migration-ready data
 */
export const getMigrationSummary = (): {
  hasData: boolean;
  isComplete: boolean;
  dataSize: number;
  itemCount: number;
} => {
  const detectedData = detectMigrationData();
  const isComplete = isMigrationComplete();
  
  return {
    hasData: detectedData.length > 0,
    isComplete,
    dataSize: detectedData.reduce((sum, item) => sum + item.size, 0),
    itemCount: detectedData.length,
  };
};
