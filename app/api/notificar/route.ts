import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { enviarAvisoValidade } from "@/lib/resend";
import { differenceInDays, parseISO, startOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  // Proteção simples por token
  const token = req.nextUrl.searchParams.get("token");
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { data: produtos, error } = await supabase
    .from("produtos")
    .select("*")
    .not("email_notificacao", "is", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const hoje = startOfDay(new Date());
  let enviados = 0;

  for (const produto of produtos ?? []) {
    const validade = startOfDay(parseISO(produto.validade));
    const diasRestantes = differenceInDays(validade, hoje);

    if (diasRestantes >= 0 && diasRestantes <= produto.dias_aviso) {
      await enviarAvisoValidade(
        produto.email_notificacao,
        produto.nome,
        produto.validade,
        diasRestantes
      );
      enviados++;
    }
  }

  return NextResponse.json({ ok: true, enviados });
}
