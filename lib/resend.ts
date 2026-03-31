import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarAvisoValidade(
  email: string,
  nome: string,
  validade: string,
  diasRestantes: number
) {
  const urgente = diasRestantes <= 3;

  await resend.emails.send({
    from: "VenceAí <onboarding@resend.dev>",
    to: email,
    subject: urgente
      ? `⚠️ ${nome} vence em ${diasRestantes} dia${diasRestantes !== 1 ? "s" : ""}!`
      : `🗓️ Lembrete: ${nome} vence em ${diasRestantes} dias`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: ${urgente ? "#dc2626" : "#16a34a"}; font-size: 24px;">
          ${urgente ? "⚠️ Atenção!" : "🗓️ Lembrete de Validade"}
        </h1>
        <p style="font-size: 16px; color: #374151;">
          O produto <strong>${nome}</strong> vence em
          <strong>${diasRestantes} dia${diasRestantes !== 1 ? "s" : ""}</strong>
          (${validade}).
        </p>
        <p style="color: #6b7280; font-size: 14px;">Use antes de vencer para não desperdiçar!</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">VenceAí — Controle de Validade</p>
      </div>
    `,
  });
}
