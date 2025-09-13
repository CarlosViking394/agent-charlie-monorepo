// Supabase Database Types
// Generate these types using: supabase gen types typescript --project-id xudjxewpiligutodpdsd

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          category: string
          rating_average: number
          rating_count: number
          response_time_minutes: number
          success_rate: number
          pricing_min: number
          pricing_max: number
          pricing_currency: string
          avatar_url: string | null
          verified: boolean
          insured: boolean
          available: boolean
          location_city: string
          location_state: string
          location_remote: boolean
          bio: string | null
          specialties: string[]
          languages: string[]
          years_experience: number
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          category: string
          rating_average?: number
          rating_count?: number
          response_time_minutes?: number
          success_rate?: number
          pricing_min: number
          pricing_max: number
          pricing_currency?: string
          avatar_url?: string | null
          verified?: boolean
          insured?: boolean
          available?: boolean
          location_city: string
          location_state: string
          location_remote?: boolean
          bio?: string | null
          specialties?: string[]
          languages?: string[]
          years_experience?: number
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          category?: string
          rating_average?: number
          rating_count?: number
          response_time_minutes?: number
          success_rate?: number
          pricing_min?: number
          pricing_max?: number
          pricing_currency?: string
          avatar_url?: string | null
          verified?: boolean
          insured?: boolean
          available?: boolean
          location_city?: string
          location_state?: string
          location_remote?: boolean
          bio?: string | null
          specialties?: string[]
          languages?: string[]
          years_experience?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          agent_id: string
          client_name: string
          client_email: string
          client_phone: string
          service_type: string
          title: string
          description: string
          status: string
          urgency: string
          estimated_duration: number
          budget_min: number | null
          budget_max: number | null
          budget_currency: string
          scheduled_date: string | null
          completed_date: string | null
          cancelled_date: string | null
          location_address: string | null
          location_city: string | null
          location_state: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          agent_id: string
          client_name: string
          client_email: string
          client_phone: string
          service_type: string
          title: string
          description: string
          status?: string
          urgency?: string
          estimated_duration?: number
          budget_min?: number | null
          budget_max?: number | null
          budget_currency?: string
          scheduled_date?: string | null
          completed_date?: string | null
          cancelled_date?: string | null
          location_address?: string | null
          location_city?: string | null
          location_state?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          agent_id?: string
          client_name?: string
          client_email?: string
          client_phone?: string
          service_type?: string
          title?: string
          description?: string
          status?: string
          urgency?: string
          estimated_duration?: number
          budget_min?: number | null
          budget_max?: number | null
          budget_currency?: string
          scheduled_date?: string | null
          completed_date?: string | null
          cancelled_date?: string | null
          location_address?: string | null
          location_city?: string | null
          location_state?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          agent_id: string
          booking_id: string | null
          reviewer_name: string
          rating: number
          content: string
          verified: boolean
          helpful_count: number
          agent_response: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          agent_id: string
          booking_id?: string | null
          reviewer_name: string
          rating: number
          content: string
          verified?: boolean
          helpful_count?: number
          agent_response?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          agent_id?: string
          booking_id?: string | null
          reviewer_name?: string
          rating?: number
          content?: string
          verified?: boolean
          helpful_count?: number
          agent_response?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          }
        ]
      }
      user_favorites: {
        Row: {
          id: string
          created_at: string
          user_id: string
          agent_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          agent_id: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          agent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          }
        ]
      }
      user_searches: {
        Row: {
          id: string
          created_at: string
          user_id: string | null
          query: string
          filters: Json | null
          results_count: number
          session_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id?: string | null
          query: string
          filters?: Json | null
          results_count?: number
          session_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string | null
          query?: string
          filters?: Json | null
          results_count?: number
          session_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_agents: {
        Args: {
          search_query: string
          category_filter?: string
          location_filter?: string
          max_price?: number
          min_rating?: number
          limit_count?: number
        }
        Returns: {
          id: string
          name: string
          category: string
          rating_average: number
          rating_count: number
          pricing_min: number
          pricing_max: number
          location_city: string
          location_state: string
          verified: boolean
          available: boolean
          match_score: number
        }[]
      }
    }
    Enums: {
      agent_category: 'home_services' | 'health_wellness' | 'education_tutoring' | 'business_consulting' | 'tech_support' | 'creative_services'
      booking_status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
      service_type: 'consultation' | 'project' | 'recurring' | 'emergency'
      urgency_level: 'low' | 'medium' | 'high' | 'emergency'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}