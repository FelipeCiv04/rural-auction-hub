/**
 * Tipos TypeScript que mapeiam o schema do banco de dados Supabase.
 *
 * Usado como generic no `createClient<Database>()` para tipagem completa
 * de queries, inserts e updates.
 *
 * Mantenha sincronizado com `supabase/migrations/001_initial_schema.sql`.
 */

export type UserRole = "user" | "admin";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          document: string | null;
          phone: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          document?: string | null;
          phone?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          document?: string | null;
          phone?: string | null;
          role?: UserRole;
          updated_at?: string;
        };
      };
      auctions: {
        Row: {
          id: string;
          code: string;
          title: string;
          status: "ao-vivo" | "agendado" | "encerrado";
          starts_at: string;
          location: string;
          offer: string;
          promoter: string;
          cover_url: string | null;
          summary: string;
          terms: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          title: string;
          status?: "ao-vivo" | "agendado" | "encerrado";
          starts_at: string;
          location?: string;
          offer?: string;
          promoter?: string;
          cover_url?: string | null;
          summary?: string;
          terms?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          title?: string;
          status?: "ao-vivo" | "agendado" | "encerrado";
          starts_at?: string;
          location?: string;
          offer?: string;
          promoter?: string;
          cover_url?: string | null;
          summary?: string;
          terms?: string[];
          updated_at?: string;
        };
      };
      lots: {
        Row: {
          id: string;
          auction_id: string;
          number: string;
          title: string;
          category: "elite" | "comercial" | "imovel";
          image_url: string | null;
          current_bid: number | null;
          bid_label: string;
          increment: number;
          description: string;
          seller: string;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auction_id: string;
          number: string;
          title: string;
          category?: "elite" | "comercial" | "imovel";
          image_url?: string | null;
          current_bid?: number | null;
          bid_label?: string;
          increment?: number;
          description?: string;
          seller?: string;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auction_id?: string;
          number?: string;
          title?: string;
          category?: "elite" | "comercial" | "imovel";
          image_url?: string | null;
          current_bid?: number | null;
          bid_label?: string;
          increment?: number;
          description?: string;
          seller?: string;
          is_featured?: boolean;
          updated_at?: string;
        };
      };
      lot_specs: {
        Row: {
          id: string;
          lot_id: string;
          label: string;
          value: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          lot_id: string;
          label: string;
          value: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          lot_id?: string;
          label?: string;
          value?: string;
          sort_order?: number;
        };
      };
      lot_images: {
        Row: {
          id: string;
          lot_id: string;
          url: string;
          alt: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          lot_id: string;
          url: string;
          alt?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          lot_id?: string;
          url?: string;
          alt?: string | null;
          sort_order?: number;
        };
      };
      bid_history: {
        Row: {
          id: string;
          lot_id: string;
          bidder_id: string | null;
          bidder_alias: string;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lot_id: string;
          bidder_id?: string | null;
          bidder_alias: string;
          amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          lot_id?: string;
          bidder_id?: string | null;
          bidder_alias?: string;
          amount?: number;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
}
