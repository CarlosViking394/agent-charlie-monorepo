import { BaseEntity, ID, Timestamp, ContactInfo } from './core';
import { Agent } from './agent';

// Booking status enumeration
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

// Service types
export enum ServiceType {
  CONSULTATION = 'consultation',
  PROJECT = 'project',
  RECURRING = 'recurring',
  EMERGENCY = 'emergency',
}

// Communication preferences
export interface CommunicationPreferences {
  readonly method: 'phone' | 'video' | 'in_person' | 'chat';
  readonly language: string;
  readonly accessibility?: readonly string[];
}

// Booking details
export interface BookingDetails {
  readonly serviceType: ServiceType;
  readonly title: string;
  readonly description: string;
  readonly estimatedDuration: number; // minutes
  readonly urgency: 'low' | 'medium' | 'high' | 'emergency';
  readonly location?: {
    readonly address?: string;
    readonly city: string;
    readonly state: string;
    readonly postalCode: string;
    readonly instructions?: string;
  };
  readonly budget: {
    readonly min?: number;
    readonly max?: number;
    readonly currency: string;
    readonly flexible: boolean;
  };
  readonly timeframe: {
    readonly start: Timestamp;
    readonly end?: Timestamp;
    readonly flexible: boolean;
    readonly blackoutDates?: readonly Timestamp[];
  };
  readonly requirements?: readonly string[];
  readonly attachments?: readonly string[]; // file URLs
}

// Main Booking interface
export interface Booking extends BaseEntity {
  readonly agentId: ID;
  readonly clientContact: ContactInfo;
  readonly details: BookingDetails;
  readonly status: BookingStatus;
  readonly communicationPreferences: CommunicationPreferences;
  readonly pricing: {
    readonly agreedAmount?: number;
    readonly hourlyRate?: number;
    readonly currency: string;
    readonly paymentTerms: 'upfront' | 'milestone' | 'completion';
  };
  readonly timeline: {
    readonly requestedDate: Timestamp;
    readonly scheduledDate?: Timestamp;
    readonly startedAt?: Timestamp;
    readonly completedAt?: Timestamp;
    readonly cancelledAt?: Timestamp;
  };
  readonly notes?: readonly BookingNote[];
  readonly agent?: Agent; // Populated in responses
}

// Booking notes/communication
export interface BookingNote extends BaseEntity {
  readonly bookingId: ID;
  readonly authorType: 'client' | 'agent' | 'system';
  readonly authorName: string;
  readonly content: string;
  readonly isInternal: boolean;
  readonly attachments?: readonly string[];
}

// Booking request (for creating new bookings)
export interface BookingRequest {
  readonly agentId: ID;
  readonly clientContact: ContactInfo;
  readonly details: BookingDetails;
  readonly communicationPreferences: CommunicationPreferences;
  readonly message?: string;
}

// Booking update (for modifying existing bookings)
export interface BookingUpdate {
  readonly bookingId: ID;
  readonly status?: BookingStatus;
  readonly details?: Partial<BookingDetails>;
  readonly pricing?: Partial<Booking['pricing']>;
  readonly timeline?: Partial<Booking['timeline']>;
  readonly note?: string;
}

// Booking search/filter interfaces
export interface BookingFilters {
  readonly status?: readonly BookingStatus[];
  readonly serviceType?: readonly ServiceType[];
  readonly dateRange?: {
    readonly start: Timestamp;
    readonly end: Timestamp;
  };
  readonly urgency?: readonly BookingDetails['urgency'][];
  readonly agentId?: ID;
}

export interface BookingSearchQuery {
  readonly query?: string;
  readonly filters?: BookingFilters;
  readonly sortBy?: 'date' | 'status' | 'urgency' | 'price';
  readonly sortOrder?: 'asc' | 'desc';
}

// Booking analytics (for dashboard views)
export interface BookingAnalytics {
  readonly total: number;
  readonly byStatus: Record<BookingStatus, number>;
  readonly byServiceType: Record<ServiceType, number>;
  readonly averagePrice: number;
  readonly averageDuration: number;
  readonly satisfactionScore: number;
  readonly repeatClientRate: number;
}