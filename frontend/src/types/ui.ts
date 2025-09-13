import { ID } from './core';
import { AgentCategory } from './agent';

// UI State types
export interface LoadingState {
  readonly isLoading: boolean;
  readonly message?: string;
  readonly progress?: number;
}

export interface ErrorState {
  readonly hasError: boolean;
  readonly message?: string;
  readonly code?: string;
  readonly canRetry: boolean;
}

export interface AsyncState<T> {
  readonly data?: T;
  readonly loading: LoadingState;
  readonly error: ErrorState;
}

// Navigation and routing
export interface RouteParams {
  readonly [key: string]: string | undefined;
}

export interface SearchParams {
  readonly q?: string;
  readonly category?: string;
  readonly filter?: string;
  readonly page?: string;
  readonly sort?: string;
}

// Quick action chips
export interface QuickChip {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly category?: AgentCategory;
  readonly action?: 'search' | 'filter' | 'navigate';
  readonly value?: string;
}

// Modal and overlay states
export interface ModalState {
  readonly isOpen: boolean;
  readonly type?: 'booking' | 'contact' | 'comparison' | 'filter' | 'confirmation';
  readonly data?: unknown;
  readonly onClose?: () => void;
}

// Form states
export interface FormField<T = string> {
  readonly value: T;
  readonly error?: string;
  readonly touched: boolean;
  readonly valid: boolean;
}

export interface FormState<T extends Record<string, unknown>> {
  readonly fields: { readonly [K in keyof T]: FormField<T[K]> };
  readonly isValid: boolean;
  readonly isSubmitting: boolean;
  readonly isDirty: boolean;
}

// Search interface states
export interface SearchState {
  readonly query: string;
  readonly isListening: boolean;
  readonly hasResults: boolean;
  readonly suggestions: readonly string[];
  readonly recentSearches: readonly string[];
}

// Speech recognition states
export interface SpeechRecognitionState {
  readonly isSupported: boolean;
  readonly isListening: boolean;
  readonly transcript: string;
  readonly confidence: number;
  readonly error?: string;
}

// Comparison state
export interface ComparisonState {
  readonly selectedAgents: readonly ID[];
  readonly maxSelections: number;
  readonly isComparing: boolean;
}

// Filter panel state
export interface FilterPanelState {
  readonly isOpen: boolean;
  readonly activeFilters: Record<string, unknown>;
  readonly appliedFilters: Record<string, unknown>;
  readonly hasChanges: boolean;
}

// Notification types
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export interface Notification {
  readonly id: ID;
  readonly type: NotificationType;
  readonly title: string;
  readonly message?: string;
  readonly duration?: number;
  readonly actions?: readonly NotificationAction[];
}

export interface NotificationAction {
  readonly label: string;
  readonly action: () => void;
  readonly style?: 'primary' | 'secondary' | 'danger';
}

// Theme and preferences
export interface Theme {
  readonly name: string;
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly background: string;
  readonly surface: string;
  readonly text: string;
  readonly isDark: boolean;
}

export interface UserPreferences {
  readonly theme: Theme;
  readonly language: string;
  readonly timezone: string;
  readonly currency: string;
  readonly notifications: {
    readonly email: boolean;
    readonly push: boolean;
    readonly sms: boolean;
  };
  readonly accessibility: {
    readonly reducedMotion: boolean;
    readonly highContrast: boolean;
    readonly fontSize: 'small' | 'medium' | 'large';
  };
}

// Layout and responsive states
export interface ViewportState {
  readonly width: number;
  readonly height: number;
  readonly isMobile: boolean;
  readonly isTablet: boolean;
  readonly isDesktop: boolean;
}

// Component props common patterns
export interface BaseComponentProps {
  readonly className?: string;
  readonly children?: React.ReactNode;
  readonly testId?: string;
}

export interface InteractiveComponentProps extends BaseComponentProps {
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly onClick?: () => void;
}

// Data table states
export interface TableColumn<T> {
  readonly key: keyof T;
  readonly label: string;
  readonly sortable?: boolean;
  readonly width?: string;
  readonly render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export interface TableState<T> {
  readonly columns: readonly TableColumn<T>[];
  readonly data: readonly T[];
  readonly sorting: {
    readonly column?: keyof T;
    readonly direction: 'asc' | 'desc';
  };
  readonly selection: readonly T[];
}