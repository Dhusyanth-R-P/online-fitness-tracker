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
      Users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
      Polls: {
        Row: {
          id: string
          title: string
          description: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          created_by?: string
          created_at?: string
        }
      }
      Options: {
        Row: {
          id: string
          poll_id: string
          option_text: string
        }
        Insert: {
          id?: string
          poll_id: string
          option_text: string
        }
        Update: {
          id?: string
          poll_id?: string
          option_text?: string
        }
      }
      Votes: {
        Row: {
          id: string
          poll_id: string
          option_id: string
          user_id: string
          voted_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          option_id: string
          user_id: string
          voted_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          option_id?: string
          user_id?: string
          voted_at?: string
        }
      }
    }
  }
}