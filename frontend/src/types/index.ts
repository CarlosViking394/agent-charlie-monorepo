// Re-export all types from organized modules
export * from './core';
export * from './agent';
export * from './ui';
export * from './booking';

// Legacy interfaces for backwards compatibility
import { Agent } from './agent';
import { QuickChip } from './ui';

export interface FilterOptions {
  priceRange: [number, number];
  rating: number;
  responseTime: string;
  verified: boolean;
  remote: boolean;
  available: boolean;
}

export interface SearchContext {
  query: string;
  location?: string;
  budget?: number;
  timeframe?: string;
  filters?: FilterOptions;
}

export interface ComparisonAgent extends Agent {
  selected: boolean;
}