# MiniKo Squishy FunBox™ — Landing page com PIX (ProPixBR)

Landing page de alta conversão com pagamento PIX integrado à API **ProPixBR** (`https://api.propixbr.com`).
As credenciais ficam sempre no servidor: o frontend só fala com as rotas internas
`/api/public/pix/create` e `/api/public/pix/check`.

## Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `PROPAY_CLIENT_ID` | Client ID da ProPixBR (`live_...`) |
| `PROPAY_CLIENT_SECRET` | Client Secret da ProPixBR (`sk_...`) |
| `PROPAY_BASE_URL` | Opcional. Padrão: `https://api.propixbr.com` |

Nunca coloque essas chaves no código do frontend.

## Publicar na Netlify

1. Suba o repositório e conecte-o na Netlify.
2. O arquivo `netlify.toml` já define build (`npm run build`), publicação (`dist/client`)
   e a pasta de funções (`netlify/functions`).
3. Em **Site settings → Environment variables**, cadastre `PROPAY_CLIENT_ID` e
   `PROPAY_CLIENT_SECRET`.
4. Faça o deploy. As chamadas do frontend são redirecionadas automaticamente:
   - `/api/public/pix/create` → `netlify/functions/pix-create.ts`
   - `/api/public/pix/check` → `netlify/functions/pix-check.ts`

## Testar localmente

```bash
npm install
# credenciais locais
echo "PROPAY_CLIENT_ID=seu_client_id" >> .env
echo "PROPAY_CLIENT_SECRET=seu_client_secret" >> .env
npm run dev        # app + rotas /api/public/pix/*
```

Para testar as Netlify Functions localmente: `npx netlify dev`.

## Alterar Client ID e Client Secret

Basta atualizar as variáveis de ambiente (Netlify → Environment variables, ou o `.env` local)
e refazer o deploy. Nenhuma alteração de código é necessária.

## Atualizar a API no futuro

Toda a comunicação com a ProPixBR está isolada em dois arquivos equivalentes:

- `src/lib/propay.server.ts` — usado pelas rotas de servidor do app.
- `netlify/functions/propay.ts` — usado pelas Netlify Functions.

Ali ficam a URL base, os headers (`x-client-id`, `x-client-secret`), o corpo enviado
(`amount`, `description`, `payerName`, `payerDocument`) e a normalização da resposta
(`transactionId`, `copyPaste`, `qrcodeUrl`, `status`, `transactionState`).
Mudanças de contrato da API se resolvem nesses dois arquivos.

## Fluxo de pagamento

1. Usuário escolhe a FunBox e abre o carrinho.
2. Informa nome e CPF e clica em **Pagar com PIX**.
3. A função do servidor chama `POST /api/v1/deposit` e devolve QR Code + copia e cola.
4. A tela mostra o QR Code, o código copia e cola, o botão **Copiar PIX** e o status
   "Aguardando pagamento".
5. A cada 3 segundos o app consulta `POST /api/v1/check`. Quando `transactionState` for
   `COMPLETO`, o polling para e a confirmação aparece na hora, sem recarregar a página.
6. Erros e timeouts exibem mensagem amigável com opção de tentar novamente.
