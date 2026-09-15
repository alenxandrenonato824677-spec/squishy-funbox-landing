import { checkPix, json } from "./propay";

export const handler = async (event: { httpMethod: string; body?: string | null }) => {
  if (event.httpMethod !== "POST") return json({ error: "Método não permitido." }, 405);

  try {
    const body = JSON.parse(event.body || "{}") as Record<string, unknown>;
    const transactionId = String(body.transactionId ?? "").trim();
    if (!transactionId) return json({ error: "transactionId é obrigatório." }, 400);

    const result = await checkPix(transactionId);
    if (!result.ok) return json({ error: result.message }, result.status);
    return json(result.data);
  } catch (error) {
    console.error(error);
    return json({ error: "Não foi possível consultar o pagamento." }, 500);
  }
};
