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
      users: {
        Row: {
          id: string
          email: string
          role: 'sales_agent' | 'supplier' | 'back_office' | 'admin'
          language_preference: 'en' | 'ro'
          created_at: string
          updated_at: string
          first_name?: string
          last_name?: string
          phone?: string
          is_active: boolean
        }
        Insert: {
          id?: string
          email: string
          role: 'sales_agent' | 'supplier' | 'back_office' | 'admin'
          language_preference?: 'en' | 'ro'
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          phone?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          role?: 'sales_agent' | 'supplier' | 'back_office' | 'admin'
          language_preference?: 'en' | 'ro'
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          phone?: string
          is_active?: boolean
        }
      }
      zones: {
        Row: {
          id: string
          code: string
          name: string
          description?: string
          counties: string[]
          cities?: string[]
          market_potential: number
          historical_volume: number
          average_price: number
          active_suppliers: number
          total_suppliers: number
          assigned_agents: string[]
          primary_agent?: string
          coverage: number
          performance_rating: number
          competitiveness: 'low' | 'medium' | 'high'
          growth_potential: 'low' | 'medium' | 'high'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string
          counties: string[]
          cities?: string[]
          market_potential: number
          historical_volume: number
          average_price: number
          active_suppliers?: number
          total_suppliers?: number
          assigned_agents?: string[]
          primary_agent?: string
          coverage?: number
          performance_rating?: number
          competitiveness?: 'low' | 'medium' | 'high'
          growth_potential?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string
          counties?: string[]
          cities?: string[]
          market_potential?: number
          historical_volume?: number
          average_price?: number
          active_suppliers?: number
          total_suppliers?: number
          assigned_agents?: string[]
          primary_agent?: string
          coverage?: number
          performance_rating?: number
          competitiveness?: 'low' | 'medium' | 'high'
          growth_potential?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
      }
      supplier_profiles: {
        Row: {
          id: string
          user_id: string
          business_name: string
          business_type: 'PJ' | 'PF'
          contact_person: string
          email: string
          phone: string
          alternative_phone?: string
          address: string
          city: string
          county: string
          postal_code: string
          country: string
          grain_types: string[]
          estimated_volume?: number
          bank_account?: string
          cui?: string
          onrc_number?: string
          apia_id?: string
          language_preference: 'en' | 'ro'
          assigned_zone?: string
          registration_status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
          approval_date?: string
          assigned_agent?: string
          created_at: string
          updated_at: string
          romanian_business_data?: Json
          validation_status: 'not_reviewed' | 'under_review' | 'approved' | 'rejected'
          validation_notes?: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          business_type: 'PJ' | 'PF'
          contact_person: string
          email: string
          phone: string
          alternative_phone?: string
          address: string
          city: string
          county: string
          postal_code: string
          country?: string
          grain_types: string[]
          estimated_volume?: number
          bank_account?: string
          cui?: string
          onrc_number?: string
          apia_id?: string
          language_preference?: 'en' | 'ro'
          assigned_zone?: string
          registration_status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
          approval_date?: string
          assigned_agent?: string
          created_at?: string
          updated_at?: string
          romanian_business_data?: Json
          validation_status?: 'not_reviewed' | 'under_review' | 'approved' | 'rejected'
          validation_notes?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          business_type?: 'PJ' | 'PF'
          contact_person?: string
          email?: string
          phone?: string
          alternative_phone?: string
          address?: string
          city?: string
          county?: string
          postal_code?: string
          country?: string
          grain_types?: string[]
          estimated_volume?: number
          bank_account?: string
          cui?: string
          onrc_number?: string
          apia_id?: string
          language_preference?: 'en' | 'ro'
          assigned_zone?: string
          registration_status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
          approval_date?: string
          assigned_agent?: string
          created_at?: string
          updated_at?: string
          romanian_business_data?: Json
          validation_status?: 'not_reviewed' | 'under_review' | 'approved' | 'rejected'
          validation_notes?: string
        }
      }
      documents: {
        Row: {
          id: string
          supplier_id: string
          document_type: 'onrc_certificate' | 'farmer_id_card' | 'apia_certificate' | 'bank_statement' | 'identity_card' | 'other'
          filename: string
          file_path: string
          file_size: number
          mime_type: string
          upload_status: 'pending' | 'uploading' | 'completed' | 'failed'
          validation_status: 'not_reviewed' | 'under_review' | 'approved' | 'rejected'
          ocr_status: 'pending' | 'processing' | 'completed' | 'failed'
          ocr_result_id?: string
          uploaded_by: string
          created_at: string
          updated_at: string
          validation_notes?: string
        }
        Insert: {
          id?: string
          supplier_id: string
          document_type: 'onrc_certificate' | 'farmer_id_card' | 'apia_certificate' | 'bank_statement' | 'identity_card' | 'other'
          filename: string
          file_path: string
          file_size: number
          mime_type: string
          upload_status?: 'pending' | 'uploading' | 'completed' | 'failed'
          validation_status?: 'not_reviewed' | 'under_review' | 'approved' | 'rejected'
          ocr_status?: 'pending' | 'processing' | 'completed' | 'failed'
          ocr_result_id?: string
          uploaded_by: string
          created_at?: string
          updated_at?: string
          validation_notes?: string
        }
        Update: {
          id?: string
          supplier_id?: string
          document_type?: 'onrc_certificate' | 'farmer_id_card' | 'apia_certificate' | 'bank_statement' | 'identity_card' | 'other'
          filename?: string
          file_path?: string
          file_size?: number
          mime_type?: string
          upload_status?: 'pending' | 'uploading' | 'completed' | 'failed'
          validation_status?: 'not_reviewed' | 'under_review' | 'approved' | 'rejected'
          ocr_status?: 'pending' | 'processing' | 'completed' | 'failed'
          ocr_result_id?: string
          uploaded_by?: string
          created_at?: string
          updated_at?: string
          validation_notes?: string
        }
      }
      ocr_results: {
        Row: {
          id: string
          document_id: string
          raw_text: string
          extracted_data: Json
          overall_confidence: number
          field_confidences: Json
          confidence_level: 'high' | 'medium' | 'low'
          processing_time: number
          processed_at: string
          ocr_provider: string
          model_version?: string
          errors: Json
          warnings: string[]
          requires_review: boolean
          reviewed_by?: string
          reviewed_at?: string
          manual_corrections?: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          document_id: string
          raw_text: string
          extracted_data: Json
          overall_confidence: number
          field_confidences: Json
          confidence_level: 'high' | 'medium' | 'low'
          processing_time: number
          processed_at: string
          ocr_provider: string
          model_version?: string
          errors?: Json
          warnings?: string[]
          requires_review?: boolean
          reviewed_by?: string
          reviewed_at?: string
          manual_corrections?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          raw_text?: string
          extracted_data?: Json
          overall_confidence?: number
          field_confidences?: Json
          confidence_level?: 'high' | 'medium' | 'low'
          processing_time?: number
          processed_at?: string
          ocr_provider?: string
          model_version?: string
          errors?: Json
          warnings?: string[]
          requires_review?: boolean
          reviewed_by?: string
          reviewed_at?: string
          manual_corrections?: Json
          created_at?: string
          updated_at?: string
        }
      }
      purchase_targets: {
        Row: {
          id: string
          name: string
          description?: string
          sales_agent_id: string
          zone_id: string
          year: number
          quarter?: number
          month?: number
          start_date: string
          end_date: string
          target_volume: number
          target_value: number
          target_suppliers: number
          target_market_share?: number
          actual_volume: number
          actual_value: number
          actual_suppliers: number
          actual_market_share?: number
          volume_progress: number
          value_progress: number
          supplier_progress: number
          overall_progress: number
          status: 'draft' | 'active' | 'on_track' | 'at_risk' | 'behind' | 'exceeded' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'critical'
          auto_calculate: boolean
          notes?: string
          created_at: string
          updated_at: string
          created_by: string
          updated_by: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          sales_agent_id: string
          zone_id: string
          year: number
          quarter?: number
          month?: number
          start_date: string
          end_date: string
          target_volume: number
          target_value: number
          target_suppliers: number
          target_market_share?: number
          actual_volume?: number
          actual_value?: number
          actual_suppliers?: number
          actual_market_share?: number
          volume_progress?: number
          value_progress?: number
          supplier_progress?: number
          overall_progress?: number
          status?: 'draft' | 'active' | 'on_track' | 'at_risk' | 'behind' | 'exceeded' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          auto_calculate?: boolean
          notes?: string
          created_at?: string
          updated_at?: string
          created_by: string
          updated_by?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          sales_agent_id?: string
          zone_id?: string
          year?: number
          quarter?: number
          month?: number
          start_date?: string
          end_date?: string
          target_volume?: number
          target_value?: number
          target_suppliers?: number
          target_market_share?: number
          actual_volume?: number
          actual_value?: number
          actual_suppliers?: number
          actual_market_share?: number
          volume_progress?: number
          value_progress?: number
          supplier_progress?: number
          overall_progress?: number
          status?: 'draft' | 'active' | 'on_track' | 'at_risk' | 'behind' | 'exceeded' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          auto_calculate?: boolean
          notes?: string
          created_at?: string
          updated_at?: string
          created_by?: string
          updated_by?: string
        }
      }
      sales_offers: {
        Row: {
          id: string
          supplier_id: string
          grain_type: string
          quantity: number
          price_per_ton: number
          total_value: number
          quality_specifications?: Json
          delivery_location: string
          delivery_date: string
          offer_status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'expired'
          valid_until: string
          notes?: string
          reviewed_by?: string
          reviewed_at?: string
          review_notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          supplier_id: string
          grain_type: string
          quantity: number
          price_per_ton: number
          total_value: number
          quality_specifications?: Json
          delivery_location: string
          delivery_date: string
          offer_status?: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'expired'
          valid_until: string
          notes?: string
          reviewed_by?: string
          reviewed_at?: string
          review_notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string
          grain_type?: string
          quantity?: number
          price_per_ton?: number
          total_value?: number
          quality_specifications?: Json
          delivery_location?: string
          delivery_date?: string
          offer_status?: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'expired'
          valid_until?: string
          notes?: string
          reviewed_by?: string
          reviewed_at?: string
          review_notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      input_purchase_requests: {
        Row: {
          id: string
          supplier_id: string
          input_type: string
          quantity: number
          price_per_unit: number
          total_value: number
          specifications?: Json
          delivery_location: string
          requested_delivery_date: string
          request_status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'fulfilled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          notes?: string
          reviewed_by?: string
          reviewed_at?: string
          review_notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          supplier_id: string
          input_type: string
          quantity: number
          price_per_unit: number
          total_value: number
          specifications?: Json
          delivery_location: string
          requested_delivery_date: string
          request_status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'fulfilled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          notes?: string
          reviewed_by?: string
          reviewed_at?: string
          review_notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string
          input_type?: string
          quantity?: number
          price_per_unit?: number
          total_value?: number
          specifications?: Json
          delivery_location?: string
          requested_delivery_date?: string
          request_status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'fulfilled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          notes?: string
          reviewed_by?: string
          reviewed_at?: string
          review_notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          name: string
          legal_type: 'individual' | 'legal_entity'
          tax_id?: string
          agent_id?: string
          status: 'draft' | 'pending_validation' | 'valid' | 'rejected'
          contact_type: 'supplier' | 'buyer' | 'both'
          street: string
          city: string
          county: string
          country: string
          postal_code: string
          phone: string
          email: string
          first_name?: string
          last_name?: string
          full_name?: string
          id_series?: string
          id_number?: string
          personal_identification_number?: string
          company_name?: string
          trade_register_number?: string
          vat_registration_number?: string
          company_number?: string
          iban?: string
          bank_name?: string
          swift_code?: string
          iban_validated: boolean
          anaf_verified: boolean
          anaf_data?: Json
          anaf_last_checked?: string
          cultivated_area?: number
          purchase_potential?: string
          annual_purchase_target?: number
          apia_certificate_number?: string
          apia_certificate_expiration?: string
          validation_status: 'not_reviewed' | 'under_review' | 'approved' | 'rejected'
          validation_notes?: string
          validated_by?: string
          validated_at?: string
          can_place_orders: boolean
          requires_backoffice_validation: boolean
          created_by: string
          created_at: string
          updated_by: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          legal_type: 'individual' | 'legal_entity'
          tax_id?: string
          agent_id?: string
          status?: 'draft' | 'pending_validation' | 'valid' | 'rejected'
          contact_type: 'supplier' | 'buyer' | 'both'
          street: string
          city: string
          county: string
          country?: string
          postal_code: string
          phone: string
          email: string
          first_name?: string
          last_name?: string
          full_name?: string
          id_series?: string
          id_number?: string
          personal_identification_number?: string
          company_name?: string
          trade_register_number?: string
          vat_registration_number?: string
          company_number?: string
          iban?: string
          bank_name?: string
          swift_code?: string
          iban_validated?: boolean
          anaf_verified?: boolean
          anaf_data?: Json
          anaf_last_checked?: string
          cultivated_area?: number
          purchase_potential?: string
          annual_purchase_target?: number
          apia_certificate_number?: string
          apia_certificate_expiration?: string
          validation_status?: 'not_reviewed' | 'under_review' | 'approved' | 'rejected'
          validation_notes?: string
          validated_by?: string
          validated_at?: string
          can_place_orders?: boolean
          requires_backoffice_validation?: boolean
          created_by: string
          created_at?: string
          updated_by: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          legal_type?: 'individual' | 'legal_entity'
          tax_id?: string
          agent_id?: string
          status?: 'draft' | 'pending_validation' | 'valid' | 'rejected'
          contact_type?: 'supplier' | 'buyer' | 'both'
          street?: string
          city?: string
          county?: string
          country?: string
          postal_code?: string
          phone?: string
          email?: string
          first_name?: string
          last_name?: string
          full_name?: string
          id_series?: string
          id_number?: string
          personal_identification_number?: string
          company_name?: string
          trade_register_number?: string
          vat_registration_number?: string
          company_number?: string
          iban?: string
          bank_name?: string
          swift_code?: string
          iban_validated?: boolean
          anaf_verified?: boolean
          anaf_data?: Json
          anaf_last_checked?: string
          cultivated_area?: number
          purchase_potential?: string
          annual_purchase_target?: number
          apia_certificate_number?: string
          apia_certificate_expiration?: string
          validation_status?: 'not_reviewed' | 'under_review' | 'approved' | 'rejected'
          validation_notes?: string
          validated_by?: string
          validated_at?: string
          can_place_orders?: boolean
          requires_backoffice_validation?: boolean
          created_by?: string
          created_at?: string
          updated_by?: string
          updated_at?: string
        }
      }
      contact_loading_addresses: {
        Row: {
          id: string
          contact_id: string
          name: string
          phone: string
          address: string
          postal_code: string
          unloading_location: string
          secondary_address?: string
          secondary_address_2?: string
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          name: string
          phone: string
          address: string
          postal_code: string
          unloading_location: string
          secondary_address?: string
          secondary_address_2?: string
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          name?: string
          phone?: string
          address?: string
          postal_code?: string
          unloading_location?: string
          secondary_address?: string
          secondary_address_2?: string
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      contact_associated_contacts: {
        Row: {
          id: string
          contact_id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          role?: string
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          role?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          role?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      contact_documents: {
        Row: {
          id: string
          contact_id: string
          filename: string
          file_path: string
          file_size: number
          mime_type: string
          document_type: string
          description?: string
          uploaded_by: string
          uploaded_at: string
          validation_status: 'not_reviewed' | 'under_review' | 'approved' | 'rejected'
          validation_notes?: string
          validated_by?: string
          validated_at?: string
          ocr_status?: 'pending' | 'processing' | 'completed' | 'failed'
          ocr_result_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          filename: string
          file_path: string
          file_size: number
          mime_type: string
          document_type: string
          description?: string
          uploaded_by: string
          uploaded_at?: string
          validation_status?: 'not_reviewed' | 'under_review' | 'approved' | 'rejected'
          validation_notes?: string
          validated_by?: string
          validated_at?: string
          ocr_status?: 'pending' | 'processing' | 'completed' | 'failed'
          ocr_result_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          filename?: string
          file_path?: string
          file_size?: number
          mime_type?: string
          document_type?: string
          description?: string
          uploaded_by?: string
          uploaded_at?: string
          validation_status?: 'not_reviewed' | 'under_review' | 'approved' | 'rejected'
          validation_notes?: string
          validated_by?: string
          validated_at?: string
          ocr_status?: 'pending' | 'processing' | 'completed' | 'failed'
          ocr_result_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'sales_agent' | 'supplier' | 'back_office' | 'admin'
      language_preference: 'en' | 'ro'
      business_type: 'PJ' | 'PF'
      document_type: 'onrc_certificate' | 'farmer_id_card' | 'apia_certificate' | 'bank_statement' | 'identity_card' | 'other'
      status_type: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'failed' | 'completed'
      confidence_level: 'high' | 'medium' | 'low'
      priority_level: 'low' | 'medium' | 'high' | 'critical' | 'urgent'
      competitiveness_level: 'low' | 'medium' | 'high'
      target_status: 'draft' | 'active' | 'on_track' | 'at_risk' | 'behind' | 'exceeded' | 'completed' | 'cancelled'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']