// Types generated from Supabase schema

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
      projects: {
        Row: {
          id: string
          slug: string
          name: string
          location: string | null
          direccion: string | null
          description: string | null
          estado: 'preventa' | 'en_construccion' | 'entrega_inmediata' | 'disponible' | 'vendido' | null
          entrega: string | null
          units_available: number | null
          total_units: number | null
          price_min: number | null
          price_max: number | null
          price_currency: string | null
          precio_m2_min: number | null
          precio_m2_max: number | null
          features: Json | null
          amenities: Json | null
          tipologias: Json | null
          tipologias_texto: string | null
          oferta_especial: Json | null
          lotes_disponibles: Json | null
          financiacion: string | null
          contact_phone: string | null
          website: string | null
          images: Json | null
          brochure_url: string | null
          pendiente_info: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      agents: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          whatsapp: string | null
          role: 'admin' | 'agent' | 'viewer' | null
          avatar_url: string | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['agents']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['agents']['Insert']>
      }
      leads: {
        Row: {
          id: string
          name: string | null
          phone: string | null
          email: string | null
          avatar_url: string | null
          whatsapp_id: string | null
          instagram_id: string | null
          facebook_id: string | null
          project: string | null
          project_id: string | null
          agent_type: 'emprendimientos' | 'inmuebles' | 'tasaciones' | null
          channel: 'whatsapp' | 'instagram' | 'facebook' | 'web' | 'manual' | null
          stage: 'nuevo' | 'calificado' | 'contactado' | 'visita' | 'cierre' | null
          score: number | null
          interest: string | null
          budget: string | null
          budget_min: number | null
          budget_max: number | null
          budget_currency: 'USD' | 'ARS' | null
          assigned_to: string | null
          assigned_agent_id: string | null
          notes: string | null
          scheduled_date: string | null
          history: Json | null
          last_activity: string | null
          last_activity_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          lead_id: string | null
          avatar: string | null
          name: string | null
          phone: string | null
          project: string | null
          agent_type: 'emprendimientos' | 'inmuebles' | 'tasaciones' | null
          status: 'ai_active' | 'needs_human' | 'closed' | null
          channel: 'whatsapp' | 'instagram' | 'facebook' | null
          last_message: string | null
          last_message_time: string | null
          last_message_at: string | null
          unread: boolean | null
          is_typing: boolean | null
          external_id: string | null
          escalated_to: string | null
          escalated_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
      messages: {
        Row: {
          id: string
          conversation_id: string | null
          content: string
          sender: 'lead' | 'ai' | 'human'
          sender_name: string | null
          sender_id: string | null
          timestamp: string | null
          sent_at: string | null
          status: 'sent' | 'delivered' | 'read' | null
          message_type: 'text' | 'image' | 'audio' | 'document' | 'location' | null
          media_url: string | null
          external_id: string | null
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          type: 'new_lead' | 'high_score' | 'escalation' | 'handoff' | 'appointment' | 'follow_up' | 'system' | 'appraisal_complete'
          title: string
          message: string | null
          lead_id: string | null
          conversation_id: string | null
          agent_id: string | null
          priority: 'low' | 'normal' | 'high' | 'urgent'
          read: boolean
          read_at: string | null
          action_url: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      properties: {
        Row: {
          id: string
          address: string
          neighborhood: string | null
          city: string | null
          type: 'departamento' | 'casa' | 'ph' | 'local' | 'oficina' | 'terreno'
          operation: 'venta' | 'alquiler' | 'temporal'
          rooms: number | null
          bathrooms: number | null
          sqm_total: number | null
          sqm_covered: number | null
          price: number | null
          currency: string | null
          expenses: number | null
          expenses_currency: string | null
          status: 'disponible' | 'reservado' | 'vendido' | 'alquilado' | 'suspendido'
          description: string | null
          features: Json | null
          photos: Json | null
          video_url: string | null
          tour_360_url: string | null
          floor: string | null
          orientation: string | null
          antiquity: number | null
          garage: boolean | null
          storage: boolean | null
          agent_id: string | null
          external_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['properties']['Insert']>
      }
      appraisals: {
        Row: {
          id: string
          lead_id: string | null
          property_type: string | null
          address: string | null
          neighborhood: string | null
          city: string | null
          ambientes: number | null
          rooms: number | null
          bathrooms: number | null
          size_m2: number | null
          has_garage: boolean | null
          has_storage: boolean | null
          amenities: Json | null
          estimated_value: number | null
          estimated_currency: string | null
          status: 'pending' | 'in_progress' | 'completed' | null
          notes: string | null
          photos: Json | null
          created_at: string | null
          completed_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['appraisals']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['appraisals']['Insert']>
      }
    }
  }
}

// Helper types for easier usage
export type Project = Database['public']['Tables']['projects']['Row']
export type Agent = Database['public']['Tables']['agents']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Appraisal = Database['public']['Tables']['appraisals']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type Property = Database['public']['Tables']['properties']['Row']
