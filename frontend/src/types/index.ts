export interface Agent {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  responseTime: string;
  successRate: number;
  pricing: {
    min: number;
    max: number;
    currency: string;
  };
  avatar: string;
  verified: boolean;
  insured: boolean;
  available: boolean;
  specialties: string[];
  location: {
    city: string;
    state: string;
    remote: boolean;
  };
  description: string;
}

export interface QuickChip {
  id: string;
  label: string;
  icon?: string;
  category?: string;
}

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