import { NextRequest, NextResponse } from "next/server";
import { lerValidadeDaFoto } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const { imageBase64 } = await req.json();
  if (!imageBase64) return NextResponse.json({ error: "Imagem obrigatória" }, { status: 400 });

  const resultado = await lerValidadeDaFoto(imageBase64);
  return NextResponse.json(resultado);
}
