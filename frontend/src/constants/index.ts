// Application constants

export const APP_CONFIG = {
  name: 'Agent Charlie',
  version: '1.0.0',
  description: 'Your calm, capable companion for finding service agents',
  support: {
    email: 'support@agentcharlie.com',
    phone: '+1-800-CHARLIE',
  },
} as const;

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

export const UI_CONFIG = {
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
  },
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  maxSelections: {
    comparison: 4,
    favorites: 100,
    recentSearches: 20,
  },
} as const;

export const SPEECH_CONFIG = {
  language: 'en-US',
  maxAlternatives: 1,
  continuous: false,
  interimResults: false,
  timeout: 10000,
  confidenceThreshold: 0.7,
} as const;

export const SEARCH_CONFIG = {
  minQueryLength: 1,
  maxQueryLength: 500,
  resultsPerPage: 20,
  maxResults: 1000,
  suggestions: {
    maxCount: 5,
    minQueryLength: 2,
  },
  debounceDelay: 300,
} as const;

export const VALIDATION_CONFIG = {
  name: {
    minLength: 2,
    maxLength: 100,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254,
  },
  phone: {
    pattern: /^\+?[1-9]\d{1,14}$/,
    maxLength: 20,
  },
  message: {
    maxLength: 500,
  },
  description: {
    maxLength: 2000,
  },
} as const;

export const NOTIFICATION_CONFIG = {
  duration: {
    success: 4000,
    error: 6000,
    warning: 5000,
    info: 4000,
  },
  maxCount: 5,
  position: 'top-right',
} as const;

export const CACHE_CONFIG = {
  agents: {
    maxSize: 200,
    ttl: 300000, // 5 minutes
  },
  search: {
    maxSize: 50,
    ttl: 180000, // 3 minutes
  },
  user: {
    ttl: 3600000, // 1 hour
  },
} as const;

// Route constants
export const ROUTES = {
  home: '/',
  search: '/search',
  agent: '/agent/:id',
  compare: '/compare',
  profile: '/profile',
  bookings: '/bookings',
  favorites: '/favorites',
  settings: '/settings',
  help: '/help',
  about: '/about',
  terms: '/terms',
  privacy: '/privacy',
} as const;

// Query parameter keys
export const QUERY_PARAMS = {
  search: 'q',
  category: 'category',
  filter: 'filter',
  page: 'page',
  sort: 'sort',
  view: 'view',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  theme: 'agentCharlie_theme',
  user: 'agentCharlie_user',
  preferences: 'agentCharlie_preferences',
  recentSearches: 'agentCharlie_recentSearches',
  favorites: 'agentCharlie_favorites',
  comparison: 'agentCharlie_comparison',
  auth: 'agentCharlie_auth',
} as const;

// Agent categories with metadata
export const AGENT_CATEGORIES = {
  home_services: {
    id: 'home_services',
    name: 'Home Services',
    icon: '🏠',
    color: 'azure',
    description: 'Plumbers, electricians, cleaners, and home repair specialists',
    keywords: ['plumber', 'electrician', 'cleaner', 'handyman', 'repair'],
  },
  health_wellness: {
    id: 'health_wellness',
    name: 'Health & Wellness',
    icon: '🏥',
    color: 'orchid',
    description: 'Healthcare providers, therapists, and wellness professionals',
    keywords: ['doctor', 'therapist', 'wellness', 'massage', 'fitness'],
  },
  education_tutoring: {
    id: 'education_tutoring',
    name: 'Education & Tutoring',
    icon: '📚',
    color: 'lime',
    description: 'Tutors, teachers, and educational specialists',
    keywords: ['tutor', 'teacher', 'education', 'math', 'english', 'SAT'],
  },
  business_consulting: {
    id: 'business_consulting',
    name: 'Business Consulting',
    icon: '💼',
    color: 'amber',
    description: 'Business advisors, consultants, and professional services',
    keywords: ['consultant', 'business', 'advisor', 'strategy', 'marketing'],
  },
  tech_support: {
    id: 'tech_support',
    name: 'Tech Support',
    icon: '💻',
    color: 'azure',
    description: 'IT professionals, developers, and technical specialists',
    keywords: ['developer', 'IT', 'tech', 'computer', 'software', 'website'],
  },
  creative_services: {
    id: 'creative_services',
    name: 'Creative Services',
    icon: '🎨',
    color: 'orchid',
    description: 'Designers, photographers, and creative professionals',
    keywords: ['designer', 'photographer', 'creative', 'art', 'graphic', 'video'],
  },
} as const;

// Quick action chips
export const QUICK_CHIPS = [
  { id: 'emergency', label: 'Emergency now', icon: 'zap', category: null },
  { id: 'budget', label: 'Under $200', icon: 'dollar-sign', category: null },
  { id: 'week', label: 'This week', icon: 'clock', category: null },
  { id: 'nearby', label: 'Near me', icon: 'map-pin', category: null },
] as const;

// Error messages
export const ERROR_MESSAGES = {
  network: 'Network connection failed. Please check your internet connection.',
  timeout: 'Request timed out. Please try again.',
  notFound: 'The requested resource was not found.',
  unauthorized: 'You are not authorized to perform this action.',
  validation: 'Please check your input and try again.',
  speechNotSupported: 'Speech recognition is not supported in your browser.',
  speechPermission: 'Microphone permission is required for voice search.',
  generic: 'An unexpected error occurred. Please try again.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  searchCompleted: 'Search completed successfully',
  agentLoaded: 'Agent profile loaded',
  bookingCreated: 'Booking request sent successfully',
  profileUpdated: 'Profile updated successfully',
  settingsSaved: 'Settings saved successfully',
} as const;

// Feature flags (for development/testing)
export const FEATURE_FLAGS = {
  enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  enableDevTools: import.meta.env.NODE_ENV === 'development',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableExperiments: import.meta.env.VITE_ENABLE_EXPERIMENTS === 'true',
} as const;

// Theme constants
export const THEMES = {
  light: {
    name: 'light',
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#8b5cf6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    isDark: false,
  },
  dark: {
    name: 'dark',
    primary: '#60a5fa',
    secondary: '#94a3b8',
    accent: '#a78bfa',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    isDark: true,
  },
} as const;