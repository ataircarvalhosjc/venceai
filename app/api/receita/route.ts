import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { produtos } = await req.json();

  if (!produtos?.length) {
    return NextResponse.json({ error: "Nenhum produto informado" }, { status: 400 });
  }

  const lista = produtos.join(", ");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Tenho esses produtos prestes a vencer: ${lista}. Sugira 1 receita simples e rápida que use pelo menos um desses ingredientes. Responda em português com: nome da receita, ingredientes principais e modo de preparo em 3 passos simples. Seja direto e prático.`,
      },
    ],
    max_tokens: 300,
  });

  const receita = response.choices[0]?.message?.content?.trim();
  return NextResponse.json({ receita });
}
