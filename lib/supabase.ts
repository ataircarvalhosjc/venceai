import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export type Produto = {
  id: number;
  nome: string;
  validade: string; // YYYY-MM-DD
  categoria: string;
  email_notificacao: string;
  dias_aviso: number;
  criado_em: string;
};
