/**
 * Feature Flags Configuration
 * Enable/disable new features for quality control and performance
 */

export const FEATURE_FLAGS = {
  // UI/UX Enhancements
  MOBILE_BOTTOM_NAV: true,        // Show bottom navigation on mobile
  OFFLINE_INDICATOR: true,        // Show offline/online status
  ONBOARDING_TOUR: true,          // Show welcome tour for new users
  SWIPEABLE_CARDS: false,         // Enable swipe gestures (experimental)
  
  // Theme Features
  THEME_TRANSITIONS: true,        // Smooth color transitions on theme change
  SYSTEM_THEME_SYNC: true,        // Auto-detect system theme preference
  PER_PAGE_THEMES: false,         // Different themes per page (experimental)
  
  // Performance
  LAZY_LOAD_IMAGES: true,         // Use Next/Image for optimization
  REDUCE_ANIMATIONS: false,       // Reduce motion for performance
  
  // Advanced Features
  FEATURE_TOOLTIPS: true,         // Show contextual help tooltips
  ADVANCED_ANALYTICS: false,      // Advanced health analytics (coming soon)
}

/**
 * Performance Configuration
 */
export const PERFORMANCE_CONFIG = {
  // Animation durations (in ms)
  THEME_TRANSITION_DURATION: 200,
  PAGE_TRANSITION_DURATION: 300,
  MICRO_ANIMATION_DURATION: 150,
  
  // Debounce delays (in ms)
  SEARCH_DEBOUNCE: 300,
  RESIZE_DEBOUNCE: 150,
  SCROLL_DEBOUNCE: 100,
}

/**
 * Quality Settings
 */
export const QUALITY_SETTINGS = {
  // Image quality
  IMAGE_QUALITY: 85,              // 0-100
  THUMBNAIL_SIZE: 200,            // pixels
  
  // Chart rendering
  CHART_ANIMATION: true,
  CHART_POINT_LIMIT: 100,         // Max data points before aggregation
  
  // Data caching
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in ms
}
