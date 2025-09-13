import {
  BaseEntity,
  ID,
  Location,
  PricingRange,
  MediaAsset,
  Rating,
  Review
} from './core';

// Agent category enumeration
export enum AgentCategory {
  HOME_SERVICES = 'home_services',
  HEALTH_WELLNESS = 'health_wellness',
  EDUCATION_TUTORING = 'education_tutoring',
  BUSINESS_CONSULTING = 'business_consulting',
  TECH_SUPPORT = 'tech_support',
  CREATIVE_SERVICES = 'creative_services',
  LEGAL_SERVICES = 'legal_services',
  FINANCIAL_SERVICES = 'financial_services',
  PERSONAL_SERVICES = 'personal_services',
}

// Agent specialties
export interface AgentSpecialty {
  readonly id: ID;
  readonly name: string;
  readonly category: AgentCategory;
  readonly verified: boolean;
  readonly certifications?: readonly string[];
}

// Agent credentials and verification
export interface AgentCredentials {
  readonly verified: boolean;
  readonly insured: boolean;
  readonly bonded: boolean;
  readonly backgroundChecked: boolean;
  readonly licenses: readonly string[];
  readonly certifications: readonly string[];
}

// Agent metrics
export interface AgentMetrics {
  readonly responseTime: {
    readonly average: number; // in minutes
    readonly category: 'instant' | 'fast' | 'moderate' | 'slow';
  };
  readonly successRate: number; // 0-100
  readonly completionRate: number; // 0-100
  readonly repeatClientRate: number; // 0-100
  readonly totalJobs: number;
  readonly totalClients: number;
}

// Agent availability status
export enum AgentStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline',
  VACATION = 'vacation',
  SUSPENDED = 'suspended',
}

// Main Agent interface
export interface Agent extends BaseEntity {
  readonly name: string;
  readonly bio: string;
  readonly avatar: MediaAsset;
  readonly category: AgentCategory;
  readonly specialties: readonly AgentSpecialty[];
  readonly location: Location;
  readonly pricing: PricingRange;
  readonly rating: Rating;
  readonly reviews: readonly Review[];
  readonly credentials: AgentCredentials;
  readonly metrics: AgentMetrics;
  readonly status: AgentStatus;
  readonly tags: readonly string[];
  readonly portfolio?: readonly MediaAsset[];
  readonly languages: readonly string[];
  readonly yearsExperience: number;
}

// Agent comparison interface
export interface ComparisonAgent extends Agent {
  readonly selected: boolean;
  readonly comparisonScore?: number;
}

// Agent search filters
export interface AgentFilters {
  readonly category?: AgentCategory;
  readonly location?: {
    readonly city?: string;
    readonly state?: string;
    readonly radius?: number; // miles
    readonly remoteOnly?: boolean;
  };
  readonly pricing?: {
    readonly min?: number;
    readonly max?: number;
    readonly currency?: string;
  };
  readonly rating?: {
    readonly minimum: number;
  };
  readonly availability?: {
    readonly status?: AgentStatus;
    readonly responseTime?: 'instant' | 'fast' | 'moderate';
  };
  readonly credentials?: {
    readonly verified?: boolean;
    readonly insured?: boolean;
    readonly backgroundChecked?: boolean;
  };
  readonly experience?: {
    readonly minYears?: number;
  };
  readonly specialties?: readonly string[];
  readonly languages?: readonly string[];
}

// Agent search query
export interface AgentSearchQuery {
  readonly query?: string;
  readonly filters?: AgentFilters;
  readonly sortBy?: 'relevance' | 'rating' | 'price' | 'distance' | 'responseTime';
  readonly sortOrder?: 'asc' | 'desc';
}