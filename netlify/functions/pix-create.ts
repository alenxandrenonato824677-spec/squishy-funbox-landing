import { createPix, json, sanitizeDocument } from "./propay";

export const handler = async (event: { httpMethod: string; body?: string | null }) => {
  if (event.httpMethod !== "POST") return json({ error: "Método não permitido." }, 405);

  try {
    const body = JSON.parse(event.body || "{}") as Record<string, unknown>;
    const amount = Number(body.amount);
    const description = String(body.description ?? "Pedido MiniKo");
    const payerName = String(body.payerName ?? "").trim();
    const payerDocument = sanitizeDocument(String(body.payerDocument ?? ""));

    if (!Number.isFinite(amount) || amount <= 0) return json({ error: "Valor do pedido inválido." }, 400);
    if (payerName.length < 3) return json({ error: "Informe seu nome completo." }, 400);
    if (payerDocument.length !== 11 && payerDocument.length !== 14) {
      return json({ error: "Informe um CPF válido (11 dígitos)." }, 400);
    }

    const result = await createPix({ amount, description, payerName, payerDocument });
    if (!result.ok) return json({ error: result.message }, result.status);
    return json(result.data);
  } catch (error) {
    console.error(error);
    return json({ error: "Não foi possível gerar o PIX. Tente novamente." }, 500);
  }
};
