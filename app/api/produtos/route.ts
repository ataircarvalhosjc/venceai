import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { lerValidadeDaFoto } from "@/lib/openai";

export async function GET() {
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .order("validade", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { imageBase64, nomeManual, validadeManual, emailNotificacao, diasAviso } = body;

  let nome = nomeManual;
  let validade = validadeManual;

  if (imageBase64 && (!nome || !validade)) {
    const resultado = await lerValidadeDaFoto(imageBase64);
    if (!nome) nome = resultado.nome;
    if (!validade) validade = resultado.validade;
  }

  if (!nome || !validade) {
    return NextResponse.json({ error: "Nome e validade são obrigatórios" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("produtos")
    .insert({
      nome,
      validade,
      email_notificacao: emailNotificacao,
      dias_aviso: diasAviso ?? 7,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const { error } = await supabase.from("produtos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
