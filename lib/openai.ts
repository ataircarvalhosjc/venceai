import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function lerValidadeDaFoto(imageBase64: string): Promise<{ nome: string; validade: string }> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analise esta imagem de um produto e retorne um JSON com:
- "nome": nome do produto (ex: "Leite Integral", "Iogurte Grego", "Remédio X")
- "validade": data de validade no formato YYYY-MM-DD

Se não conseguir identificar a validade, retorne validade como null.
Retorne APENAS o JSON, sem texto adicional.`,
          },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
          },
        ],
      },
    ],
    max_tokens: 100,
  });

  const text = response.choices[0]?.message?.content?.trim() ?? "{}";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
