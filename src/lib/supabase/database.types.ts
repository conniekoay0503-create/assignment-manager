export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      calendar_connections: {
        Row: {
          connection_status: string
          created_at: string
          encrypted_tokens: string | null
          google_account_email: string | null
          id: string
          last_successful_sync_at: string | null
          provider: string
          selected_calendar_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          connection_status?: string
          created_at?: string
          encrypted_tokens?: string | null
          google_account_email?: string | null
          id?: string
          last_successful_sync_at?: string | null
          provider?: string
          selected_calendar_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          connection_status?: string
          created_at?: string
          encrypted_tokens?: string | null
          google_account_email?: string | null
          id?: string
          last_successful_sync_at?: string | null
          provider?: string
          selected_calendar_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_event_links: {
        Row: {
          calendar_id: string
          connection_id: string
          created_at: string
          google_event_id: string
          id: string
          last_known_event_hash: string | null
          last_known_task_hash: string | null
          last_synced_at: string | null
          sync_error: string | null
          sync_status: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calendar_id: string
          connection_id: string
          created_at?: string
          google_event_id: string
          id?: string
          last_known_event_hash?: string | null
          last_known_task_hash?: string | null
          last_synced_at?: string | null
          sync_error?: string | null
          sync_status?: string
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calendar_id?: string
          connection_id?: string
          created_at?: string
          google_event_id?: string
          id?: string
          last_known_event_hash?: string | null
          last_known_task_hash?: string | null
          last_synced_at?: string | null
          sync_error?: string | null
          sync_status?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_event_links_connection_id_user_id_fkey"
            columns: ["connection_id", "user_id"]
            isOneToOne: false
            referencedRelation: "calendar_connections"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "calendar_event_links_task_id_user_id_fkey"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      calendar_sync_state: {
        Row: {
          calendar_id: string
          connection_id: string
          id: string
          last_error: string | null
          last_sync_at: string | null
          sync_status: string
          sync_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calendar_id: string
          connection_id: string
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          sync_status?: string
          sync_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calendar_id?: string
          connection_id?: string
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          sync_status?: string
          sync_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_sync_state_connection_id_user_id_fkey"
            columns: ["connection_id", "user_id"]
            isOneToOne: false
            referencedRelation: "calendar_connections"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      course_grades: {
        Row: {
          counts_toward_cgpa: boolean
          counts_toward_gpa: boolean
          course_category: string
          created_at: string
          credit_hours: number
          grade_point: number | null
          grading_profile_id: string
          id: string
          letter_grade: string | null
          marks: number | null
          module_code: string | null
          module_title: string
          notes: string | null
          result_status: string
          retake_status: string
          semester_id: string
          source: string
          subject_id: string | null
          transcript_reported_gpa_context: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          counts_toward_cgpa?: boolean
          counts_toward_gpa?: boolean
          course_category?: string
          created_at?: string
          credit_hours: number
          grade_point?: number | null
          grading_profile_id: string
          id?: string
          letter_grade?: string | null
          marks?: number | null
          module_code?: string | null
          module_title: string
          notes?: string | null
          result_status?: string
          retake_status?: string
          semester_id: string
          source?: string
          subject_id?: string | null
          transcript_reported_gpa_context?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          counts_toward_cgpa?: boolean
          counts_toward_gpa?: boolean
          course_category?: string
          created_at?: string
          credit_hours?: number
          grade_point?: number | null
          grading_profile_id?: string
          id?: string
          letter_grade?: string | null
          marks?: number | null
          module_code?: string | null
          module_title?: string
          notes?: string | null
          result_status?: string
          retake_status?: string
          semester_id?: string
          source?: string
          subject_id?: string | null
          transcript_reported_gpa_context?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_grades_grading_profile_id_user_id_fkey"
            columns: ["grading_profile_id", "user_id"]
            isOneToOne: false
            referencedRelation: "grading_profiles"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "course_grades_semester_id_user_id_fkey"
            columns: ["semester_id", "user_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "course_grades_subject_id_user_id_fkey"
            columns: ["subject_id", "user_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      document_analyses: {
        Row: {
          analysis_json: Json | null
          created_at: string
          document_id: string
          error_message: string | null
          id: string
          language_mode: string
          model_provider: string | null
          model_version: string | null
          reviewed_at: string | null
          source_metadata: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_json?: Json | null
          created_at?: string
          document_id: string
          error_message?: string | null
          id?: string
          language_mode?: string
          model_provider?: string | null
          model_version?: string | null
          reviewed_at?: string | null
          source_metadata?: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_json?: Json | null
          created_at?: string
          document_id?: string
          error_message?: string | null
          id?: string
          language_mode?: string
          model_provider?: string | null
          model_version?: string | null
          reviewed_at?: string | null
          source_metadata?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_analyses_document_id_user_id_fkey"
            columns: ["document_id", "user_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      documents: {
        Row: {
          checksum: string | null
          error_message: string | null
          file_size: number
          filename: string
          id: string
          mime_type: string
          processing_status: string
          storage_path: string
          task_id: string
          updated_at: string
          uploaded_at: string
          user_id: string
          version: number
        }
        Insert: {
          checksum?: string | null
          error_message?: string | null
          file_size: number
          filename: string
          id?: string
          mime_type: string
          processing_status?: string
          storage_path: string
          task_id: string
          updated_at?: string
          uploaded_at?: string
          user_id: string
          version?: number
        }
        Update: {
          checksum?: string | null
          error_message?: string | null
          file_size?: number
          filename?: string
          id?: string
          mime_type?: string
          processing_status?: string
          storage_path?: string
          task_id?: string
          updated_at?: string
          uploaded_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_task_id_user_id_fkey"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      grading_profiles: {
        Row: {
          created_at: string
          effective_period: string | null
          grading_rules: Json
          id: string
          institution_name: string
          profile_name: string
          programme_name: string | null
          rounding_precision: number
          source_reference: string | null
          updated_at: string
          user_id: string
          verification_status: string
        }
        Insert: {
          created_at?: string
          effective_period?: string | null
          grading_rules?: Json
          id?: string
          institution_name: string
          profile_name: string
          programme_name?: string | null
          rounding_precision?: number
          source_reference?: string | null
          updated_at?: string
          user_id: string
          verification_status?: string
        }
        Update: {
          created_at?: string
          effective_period?: string | null
          grading_rules?: Json
          id?: string
          institution_name?: string
          profile_name?: string
          programme_name?: string | null
          rounding_precision?: number
          source_reference?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: string
        }
        Relationships: []
      }
      grading_scale_entries: {
        Row: {
          grade_label: string
          grade_point: number | null
          grading_profile_id: string
          id: string
          inclusion_rule: string
          maximum_mark: number | null
          minimum_mark: number | null
          special_category: string | null
          user_id: string
          verification_status: string
        }
        Insert: {
          grade_label: string
          grade_point?: number | null
          grading_profile_id: string
          id?: string
          inclusion_rule?: string
          maximum_mark?: number | null
          minimum_mark?: number | null
          special_category?: string | null
          user_id: string
          verification_status?: string
        }
        Update: {
          grade_label?: string
          grade_point?: number | null
          grading_profile_id?: string
          id?: string
          inclusion_rule?: string
          maximum_mark?: number | null
          minimum_mark?: number | null
          special_category?: string | null
          user_id?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "grading_scale_entries_grading_profile_id_user_id_fkey"
            columns: ["grading_profile_id", "user_id"]
            isOneToOne: false
            referencedRelation: "grading_profiles"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          dismissed_at: string | null
          id: string
          message: string | null
          notification_type: string
          read_at: string | null
          scheduled_for: string
          task_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dismissed_at?: string | null
          id?: string
          message?: string | null
          notification_type: string
          read_at?: string | null
          scheduled_for?: string
          task_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          dismissed_at?: string | null
          id?: string
          message?: string | null
          notification_type?: string
          read_at?: string | null
          scheduled_for?: string
          task_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_task_id_user_id_fkey"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          preferred_locale: string
          time_zone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          preferred_locale?: string
          time_zone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_locale?: string
          time_zone?: string
          updated_at?: string
        }
        Relationships: []
      }
      semesters: {
        Row: {
          academic_year: string | null
          archived_at: string | null
          created_at: string
          end_date: string | null
          id: string
          name: string
          notes: string | null
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          academic_year?: string | null
          archived_at?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          notes?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          academic_year?: string | null
          archived_at?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          class_schedule: string | null
          code: string | null
          color: string
          created_at: string
          description: string | null
          id: string
          lecturer_email: string | null
          lecturer_name: string | null
          name: string
          personal_notes: string | null
          semester_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          class_schedule?: string | null
          code?: string | null
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          lecturer_email?: string | null
          lecturer_name?: string | null
          name: string
          personal_notes?: string | null
          semester_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          class_schedule?: string | null
          code?: string | null
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          lecturer_email?: string | null
          lecturer_name?: string | null
          name?: string
          personal_notes?: string | null
          semester_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_semester_id_user_id_fkey"
            columns: ["semester_id", "user_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      task_activity_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json
          task_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json
          task_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_activity_logs_task_id_user_id_fkey"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      task_checklist_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_completed: boolean
          position: number
          source_analysis_id: string | null
          task_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          position?: number
          source_analysis_id?: string | null
          task_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          position?: number
          source_analysis_id?: string | null
          task_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_checklist_items_source_analysis_id_user_id_fkey"
            columns: ["source_analysis_id", "user_id"]
            isOneToOne: false
            referencedRelation: "document_analyses"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "task_checklist_items_task_id_user_id_fkey"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      task_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          note_type: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          note_type?: string
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          note_type?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_notes_task_id_user_id_fkey"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      task_resources: {
        Row: {
          access_role: string | null
          created_at: string
          description: string | null
          id: string
          is_pinned: boolean
          position: number
          resource_type: string
          task_id: string
          title: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          access_role?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_pinned?: boolean
          position?: number
          resource_type?: string
          task_id: string
          title?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          access_role?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_pinned?: boolean
          position?: number
          resource_type?: string
          task_id?: string
          title?: string | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_resources_task_id_user_id_fkey"
            columns: ["task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_at: string | null
          calendar_sync_enabled: boolean
          completed_at: string | null
          completion_percentage: number
          created_at: string
          description: string | null
          due_at: string | null
          estimated_minutes: number | null
          id: string
          original_lecturer_instructions: string | null
          priority: string
          status: string
          subject_id: string
          submission_method: string | null
          submitted_at: string | null
          task_type: string
          title: string
          updated_at: string
          user_id: string
          work_mode: string | null
        }
        Insert: {
          assigned_at?: string | null
          calendar_sync_enabled?: boolean
          completed_at?: string | null
          completion_percentage?: number
          created_at?: string
          description?: string | null
          due_at?: string | null
          estimated_minutes?: number | null
          id?: string
          original_lecturer_instructions?: string | null
          priority?: string
          status?: string
          subject_id: string
          submission_method?: string | null
          submitted_at?: string | null
          task_type?: string
          title: string
          updated_at?: string
          user_id: string
          work_mode?: string | null
        }
        Update: {
          assigned_at?: string | null
          calendar_sync_enabled?: boolean
          completed_at?: string | null
          completion_percentage?: number
          created_at?: string
          description?: string | null
          due_at?: string | null
          estimated_minutes?: number | null
          id?: string
          original_lecturer_instructions?: string | null
          priority?: string
          status?: string
          subject_id?: string
          submission_method?: string | null
          submitted_at?: string | null
          task_type?: string
          title?: string
          updated_at?: string
          user_id?: string
          work_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_subject_id_user_id_fkey"
            columns: ["subject_id", "user_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
