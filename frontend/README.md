# Frontend ReclameLU (Next.js + Tailwind)

Interface em Next.js (App Router) toda em português do Brasil, consumindo a API PHP.

## Variáveis de ambiente
Crie um `.env.local` (para desenvolvimento) com:
```
NEXT_PUBLIC_API_BASE=http://localhost:8001
NEXT_PUBLIC_ADMIN_OWNER_EMAIL=felippe@luembalagens.com
```
Em produção (Vercel), configure em Settings → Environment Variables:
```
NEXT_PUBLIC_API_BASE=https://SEU_DOMINIO/reclamelu-api
NEXT_PUBLIC_ADMIN_OWNER_EMAIL=felippe@luembalagens.com
```
> Use sempre `NEXT_PUBLIC_API_BASE` (sem URLs hardcoded).

## Rodar em desenvolvimento
```
cd frontend
npm install
npm run dev
```
Abra `http://localhost:3000`.

## Build e produção local
```
npm run build
npm start
```

## Deploy na Vercel
1. Conectar repositório GitHub.
2. Root Directory: `frontend`.
3. Build: `npm run build`.
4. Output: `.next`.
5. Variáveis de ambiente: `NEXT_PUBLIC_API_BASE`, `NEXT_PUBLIC_ADMIN_OWNER_EMAIL`.

## Consumo da API
Todas as chamadas usam `process.env.NEXT_PUBLIC_API_BASE`:
```js
const apiBase = process.env.NEXT_PUBLIC_API_BASE;
const resp = await fetch(`${apiBase}/api/complaints`, { headers: {...} });
```

## Ajustes de idioma
Todo o texto exibido na UI está em pt-BR. Mantenha novos textos também em português.
