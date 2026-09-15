import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/pix/check")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { checkPix, PropayError } = await import("@/lib/propay.server");
        try {
          const body = (await request.json()) as Record<string, unknown>;
          const transactionId = String(body["transactionId"] ?? "").trim();
          if (!transactionId) {
            return Response.json({ error: "transactionId é obrigatório." }, { status: 400 });
          }
          return Response.json(await checkPix(transactionId));
        } catch (error) {
          if (error instanceof PropayError) {
            return Response.json({ error: error.message }, { status: error.status });
          }
          console.error(error);
          return Response.json({ error: "Não foi possível consultar o pagamento." }, { status: 500 });
        }
      },
    },
  },
});
