// TODO: Milestone 2 完成后，运行 `npx supabase gen types --lang=typescript > lib/supabase/types.ts`
// 下面先手动定义核心类型，后续用自动生成的替换

export type Database = {
  public: {
    Tables: {
      news: {
        Row: NewsRow;
        Insert: NewsInsert;
        Update: NewsUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export interface NewsRow {
  id: string;
  created_at: string;
  updated_at: string;
  title_zh: string;
  title_ko: string;
  content_zh: string;
  content_ko: string;
  images: string[];
  published: boolean;
  created_by: string;
  price_krw: number | null;
}

export interface NewsInsert {
  id?: string;
  created_at?: string;
  updated_at?: string;
  title_zh: string;
  title_ko: string;
  content_zh: string;
  content_ko: string;
  images?: string[];
  published?: boolean;
  created_by: string;
  price_krw?: number | null;
}

export interface NewsUpdate {
  id?: string;
  created_at?: string;
  updated_at?: string;
  title_zh?: string;
  title_ko?: string;
  content_zh?: string;
  content_ko?: string;
  images?: string[];
  published?: boolean;
  created_by?: string;
  price_krw?: number | null;
}
