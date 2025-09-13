// Core domain types
export type ID = string;
export type Timestamp = string; // ISO 8601
export type Currency = 'USD' | 'EUR' | 'GBP';

// Base entity interface
export interface BaseEntity {
  readonly id: ID;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

// Location types
export interface Coordinates {
  readonly latitude: number;
  readonly longitude: number;
}

export interface Location {
  readonly city: string;
  readonly state: string;
  readonly country?: string;
  readonly postalCode?: string;
  readonly coordinates?: Coordinates;
  readonly remote: boolean;
}

// Pricing types
export interface PricingRange {
  readonly min: number;
  readonly max: number;
  readonly currency: Currency;
  readonly unit?: 'hour' | 'project' | 'day' | 'week' | 'month';
}

// Contact information
export interface ContactInfo {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly preferredContact?: 'email' | 'phone' | 'text';
}

// Media types
export interface MediaAsset {
  readonly id: ID;
  readonly url: string;
  readonly type: 'image' | 'video' | 'document';
  readonly alt?: string;
  readonly size?: number;
  readonly mimeType?: string;
}

// Rating and review types
export interface Rating {
  readonly average: number;
  readonly count: number;
  readonly distribution?: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface Review extends BaseEntity {
  readonly authorName: string;
  readonly rating: 1 | 2 | 3 | 4 | 5;
  readonly content: string;
  readonly verified: boolean;
  readonly helpful?: number;
  readonly agentResponse?: string;
}

// Availability types
export interface TimeSlot {
  readonly start: Timestamp;
  readonly end: Timestamp;
  readonly available: boolean;
}

export interface Availability {
  readonly agentId: ID;
  readonly slots: readonly TimeSlot[];
  readonly timezone: string;
  readonly lastUpdated: Timestamp;
}

// Error types
export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly timestamp: Timestamp;
}

// Result types for API responses
export type Result<T, E = ApiError> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

// Pagination
export interface PaginationParams {
  readonly page: number;
  readonly limit: number;
  readonly offset?: number;
}

export interface PaginatedResponse<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
}

// Generic request/response wrappers
export interface ApiRequest<T = unknown> {
  readonly payload: T;
  readonly metadata?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  readonly data: T;
  readonly message?: string;
  readonly status: number;
  readonly timestamp: Timestamp;
}