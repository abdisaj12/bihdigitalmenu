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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_activity: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          entity: string
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          record_label: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          record_label?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          record_label?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          is_visible: boolean
          name: string
          name_am: string
          name_en: string
          name_om: string
          parent_id: string | null
          slug: Database["public"]["Enums"]["food_category"] | null
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_visible?: boolean
          name?: string
          name_am?: string
          name_en?: string
          name_om?: string
          parent_id?: string | null
          slug?: Database["public"]["Enums"]["food_category"] | null
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_visible?: boolean
          name?: string
          name_am?: string
          name_en?: string
          name_om?: string
          parent_id?: string | null
          slug?: Database["public"]["Enums"]["food_category"] | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          discount_amount: number | null
          discount_percent: number | null
          id: string
          times_used: number
          usage_limit: number | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          times_used?: number
          usage_limit?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          times_used?: number
          usage_limit?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      foods: {
        Row: {
          archived_at: string | null
          available: boolean
          calories: number | null
          category: Database["public"]["Enums"]["food_category"]
          created_at: string
          description: string | null
          discount_price: number | null
          gallery_images: Json
          id: string
          image_url: string | null
          ingredients: string | null
          is_best_seller: boolean
          is_featured: boolean
          is_popular: boolean
          is_recommended: boolean
          is_vegetarian: boolean
          name: string
          preparation_time: number | null
          price: number
          rating: number | null
          status: string
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          available?: boolean
          calories?: number | null
          category: Database["public"]["Enums"]["food_category"]
          created_at?: string
          description?: string | null
          discount_price?: number | null
          gallery_images?: Json
          id?: string
          image_url?: string | null
          ingredients?: string | null
          is_best_seller?: boolean
          is_featured?: boolean
          is_popular?: boolean
          is_recommended?: boolean
          is_vegetarian?: boolean
          name: string
          preparation_time?: number | null
          price: number
          rating?: number | null
          status?: string
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          available?: boolean
          calories?: number | null
          category?: Database["public"]["Enums"]["food_category"]
          created_at?: string
          description?: string | null
          discount_price?: number | null
          gallery_images?: Json
          id?: string
          image_url?: string | null
          ingredients?: string | null
          is_best_seller?: boolean
          is_featured?: boolean
          is_popular?: boolean
          is_recommended?: boolean
          is_vegetarian?: boolean
          name?: string
          preparation_time?: number | null
          price?: number
          rating?: number | null
          status?: string
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          points: number
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points: number
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points?: number
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_audit_log: {
        Row: {
          action: string
          created_at: string
          field: string | null
          food_id: string | null
          food_name: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          field?: string | null
          food_id?: string | null
          food_name?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          field?: string | null
          food_id?: string | null
          food_name?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_audit_log_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allergens: string[]
          category_id: string
          created_at: string
          deleted_at: string | null
          description_am: string
          description_en: string
          description_om: string
          dietary_tags: string[]
          discount_percent: number
          gallery: string[]
          id: string
          image_url: string | null
          ingredients: string
          ingredients_am: string
          ingredients_om: string
          is_available: boolean
          is_featured: boolean
          item_type: string
          name_am: string
          name_en: string
          name_om: string
          photo_confirmed: boolean
          prep_minutes: number | null
          price: number
          size: string | null
          sort_order: number
          status: string
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          allergens?: string[]
          category_id: string
          created_at?: string
          deleted_at?: string | null
          description_am?: string
          description_en?: string
          description_om?: string
          dietary_tags?: string[]
          discount_percent?: number
          gallery?: string[]
          id?: string
          image_url?: string | null
          ingredients?: string
          ingredients_am?: string
          ingredients_om?: string
          is_available?: boolean
          is_featured?: boolean
          item_type?: string
          name_am?: string
          name_en: string
          name_om?: string
          photo_confirmed?: boolean
          prep_minutes?: number | null
          price: number
          size?: string | null
          sort_order?: number
          status?: string
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          allergens?: string[]
          category_id?: string
          created_at?: string
          deleted_at?: string | null
          description_am?: string
          description_en?: string
          description_om?: string
          dietary_tags?: string[]
          discount_percent?: number
          gallery?: string[]
          id?: string
          image_url?: string | null
          ingredients?: string
          ingredients_am?: string
          ingredients_om?: string
          is_available?: boolean
          is_featured?: boolean
          item_type?: string
          name_am?: string
          name_en?: string
          name_om?: string
          photo_confirmed?: boolean
          prep_minutes?: number | null
          price?: number
          size?: string | null
          sort_order?: number
          status?: string
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          food_id: string
          food_name: string
          id: string
          note: string | null
          order_id: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          food_id: string
          food_name: string
          id?: string
          note?: string | null
          order_id: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string
          food_id?: string
          food_name?: string
          id?: string
          note?: string | null
          order_id?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_code: string | null
          created_at: string
          customer_name: string
          customer_phone: string | null
          discount: number
          id: string
          items: Json
          note: string | null
          order_number: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          room_service: boolean
          status: Database["public"]["Enums"]["order_status"]
          submission_id: string | null
          subtotal: number
          table_id: string | null
          table_or_room: string
          tax: number
          total: number
          updated_at: string
          user_id: string | null
          vat: number
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string
          customer_name?: string
          customer_phone?: string | null
          discount?: number
          id?: string
          items?: Json
          note?: string | null
          order_number?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          room_service?: boolean
          status?: Database["public"]["Enums"]["order_status"]
          submission_id?: string | null
          subtotal?: number
          table_id?: string | null
          table_or_room?: string
          tax?: number
          total?: number
          updated_at?: string
          user_id?: string | null
          vat?: number
        }
        Update: {
          coupon_code?: string | null
          created_at?: string
          customer_name?: string
          customer_phone?: string | null
          discount?: number
          id?: string
          items?: Json
          note?: string | null
          order_number?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          room_service?: boolean
          status?: Database["public"]["Enums"]["order_status"]
          submission_id?: string | null
          subtotal?: number
          table_id?: string | null
          table_or_room?: string
          tax?: number
          total?: number
          updated_at?: string
          user_id?: string | null
          vat?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["payment_status"] | null
          notes: string | null
          order_id: string | null
          payment_id: string
          performed_by: string | null
          previous_status: Database["public"]["Enums"]["payment_status"] | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["payment_status"] | null
          notes?: string | null
          order_id?: string | null
          payment_id: string
          performed_by?: string | null
          previous_status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["payment_status"] | null
          notes?: string | null
          order_id?: string | null
          payment_id?: string
          performed_by?: string | null
          previous_status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_audit_log_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_audit_log_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          account_number: string
          created_at: string
          display_name: string
          display_order: number
          id: string
          instructions: string | null
          is_active: boolean
          merchant_name: string
          method: Database["public"]["Enums"]["payment_method"]
          qr_image_url: string | null
          updated_at: string
        }
        Insert: {
          account_number: string
          created_at?: string
          display_name: string
          display_order?: number
          id?: string
          instructions?: string | null
          is_active?: boolean
          merchant_name: string
          method: Database["public"]["Enums"]["payment_method"]
          qr_image_url?: string | null
          updated_at?: string
        }
        Update: {
          account_number?: string
          created_at?: string
          display_name?: string
          display_order?: number
          id?: string
          instructions?: string | null
          is_active?: boolean
          merchant_name?: string
          method?: Database["public"]["Enums"]["payment_method"]
          qr_image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          order_id: string
          rejection_reason: string | null
          screenshot_url: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
          transaction_reference: string | null
          updated_at: string
          verification_date: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          order_id: string
          rejection_reason?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          transaction_reference?: string | null
          updated_at?: string
          verification_date?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          order_id?: string
          rejection_reason?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          transaction_reference?: string | null
          updated_at?: string
          verification_date?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          item_id: string
          new_price: number
          old_price: number | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          item_id: string
          new_price: number
          old_price?: number | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          item_id?: string
          new_price?: number
          old_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          loyalty_points: number
          phone: string | null
          theme: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          loyalty_points?: number
          phone?: string | null
          theme?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          loyalty_points?: number
          phone?: string | null
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          created_at: string
          customer_name: string
          customer_phone: string
          id: string
          note: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          status: Database["public"]["Enums"]["reservation_status"]
          table_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_name: string
          customer_phone: string
          id?: string
          note?: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          status?: Database["public"]["Enums"]["reservation_status"]
          table_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          note?: string | null
          party_size?: number
          reservation_date?: string
          reservation_time?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          table_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_settings: {
        Row: {
          address: string | null
          created_at: string
          currency: string
          email: string | null
          facebook: string | null
          id: string
          instagram: string | null
          language: string
          logo: string | null
          opening_hours: Json | null
          phone: string | null
          restaurant_name: string
          singleton: boolean
          theme: string
          tiktok: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          language?: string
          logo?: string | null
          opening_hours?: Json | null
          phone?: string | null
          restaurant_name?: string
          singleton?: boolean
          theme?: string
          tiktok?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          language?: string
          logo?: string | null
          opening_hours?: Json | null
          phone?: string | null
          restaurant_name?: string
          singleton?: boolean
          theme?: string
          tiktok?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_name: string | null
          food_id: string | null
          id: string
          order_id: string | null
          rating: number
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_name?: string | null
          food_id?: string | null
          id?: string
          order_id?: string | null
          rating: number
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_name?: string | null
          food_id?: string | null
          id?: string
          order_id?: string | null
          rating?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          currency: string
          default_language: string
          hotel_name: string
          id: boolean
          languages: string[]
          logo_url: string | null
          opening_hours: string
          phone: string
          prices_include_vat: boolean
          vat_percent: number
          wifi_name: string
          wifi_password: string
        }
        Insert: {
          currency?: string
          default_language?: string
          hotel_name?: string
          id?: boolean
          languages?: string[]
          logo_url?: string | null
          opening_hours?: string
          phone?: string
          prices_include_vat?: boolean
          vat_percent?: number
          wifi_name?: string
          wifi_password?: string
        }
        Update: {
          currency?: string
          default_language?: string
          hotel_name?: string
          id?: boolean
          languages?: string[]
          logo_url?: string | null
          opening_hours?: string
          phone?: string
          prices_include_vat?: boolean
          vat_percent?: number
          wifi_name?: string
          wifi_password?: string
        }
        Relationships: []
      }
      tables: {
        Row: {
          capacity: number
          created_at: string
          id: string
          is_room: boolean
          qr_code: string | null
          room_number: string | null
          status: Database["public"]["Enums"]["table_status"]
          table_number: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          id?: string
          is_room?: boolean
          qr_code?: string | null
          room_number?: string | null
          status?: Database["public"]["Enums"]["table_status"]
          table_number: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          is_room?: boolean
          qr_code?: string | null
          room_number?: string | null
          status?: Database["public"]["Enums"]["table_status"]
          table_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_order_items: {
        Args: { p_id: string }
        Returns: {
          food_name: string
          id: string
          note: string
          quantity: number
          subtotal: number
          unit_price: number
        }[]
      }
      get_order_payment: {
        Args: { p_order_id: string }
        Returns: {
          id: string
          rejection_reason: string
          status: Database["public"]["Enums"]["payment_status"]
          transaction_reference: string
        }[]
      }
      get_order_summary: {
        Args: { p_id: string }
        Returns: {
          created_at: string
          customer_name: string
          id: string
          order_number: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          room_service: boolean
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax: number
          total: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_menu_admin: { Args: { _uid: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      place_order: {
        Args: {
          p_customer_name: string
          p_customer_phone?: string
          p_items?: Json
          p_note?: string
          p_room_service?: boolean
          p_table_id?: string
        }
        Returns: {
          id: string
          order_number: string
        }[]
      }
      submit_payment: {
        Args: {
          p_method: Database["public"]["Enums"]["payment_method"]
          p_order_id: string
          p_screenshot_url?: string
          p_transaction_reference?: string
        }
        Returns: {
          id: string
          rejection_reason: string
          status: Database["public"]["Enums"]["payment_status"]
          transaction_reference: string
        }[]
      }
      validate_coupon: {
        Args: { p_code: string }
        Returns: {
          code: string
          discount_amount: number
          discount_percent: number
          valid_until: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "waiter"
        | "kitchen"
        | "cashier"
        | "customer"
        | "super_admin"
      food_category:
        | "breakfast"
        | "lunch"
        | "dinner"
        | "drinks"
        | "desserts"
        | "special"
      order_status:
        | "pending"
        | "accepted"
        | "preparing"
        | "ready"
        | "delivered"
        | "cancelled"
        | "new"
        | "served"
        | "paid"
      payment_method:
        | "chapa"
        | "telebirr"
        | "cbe_birr"
        | "visa"
        | "mastercard"
        | "cash"
      payment_status:
        | "pending"
        | "completed"
        | "failed"
        | "refunded"
        | "verifying"
        | "rejected"
      reservation_status:
        | "pending"
        | "confirmed"
        | "seated"
        | "cancelled"
        | "completed"
      table_status: "available" | "occupied" | "reserved" | "cleaning"
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
    Enums: {
      app_role: [
        "admin",
        "waiter",
        "kitchen",
        "cashier",
        "customer",
        "super_admin",
      ],
      food_category: [
        "breakfast",
        "lunch",
        "dinner",
        "drinks",
        "desserts",
        "special",
      ],
      order_status: [
        "pending",
        "accepted",
        "preparing",
        "ready",
        "delivered",
        "cancelled",
        "new",
        "served",
        "paid",
      ],
      payment_method: [
        "chapa",
        "telebirr",
        "cbe_birr",
        "visa",
        "mastercard",
        "cash",
      ],
      payment_status: [
        "pending",
        "completed",
        "failed",
        "refunded",
        "verifying",
        "rejected",
      ],
      reservation_status: [
        "pending",
        "confirmed",
        "seated",
        "cancelled",
        "completed",
      ],
      table_status: ["available", "occupied", "reserved", "cleaning"],
    },
  },
} as const
