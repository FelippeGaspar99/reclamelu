# ReclameLU – Sistema interno de reclamações

Plataforma web (PHP + MySQL + Next.js) para registrar, acompanhar e analisar reclamações internas.

## Estrutura do projeto
- `backend/` – API PHP 8+ (rotas REST, JWT, migrations, seeds). **Não é hospedado na Vercel.**
- `frontend/` – Next.js (App Router) + Tailwind. **Será hospedado na Vercel.**
- `backend/database/` – migrations SQL e seeds.

## Requisitos locais
- PHP 8.1+ com extensão PDO MySQL
- MySQL 8+
- Node 18+ / npm
- Git instalado

## Backend (local ou servidor externo)
1. Copie `backend/.env.example` para `backend/.env` e ajuste suas credenciais.
2. Rode migrations e seeds:
   ```
   php backend/scripts/run_migrations.php
   php backend/scripts/run_seeders.php
   ```
   (Cria usuário admin `admin@company.com` / `admin123`.)
3. Suba o servidor PHP em dev:
   ```
   cd backend
   php -S localhost:8000 -t public public/index.php
   ```
   A API ficará em `http://localhost:8000/api/*`.

> Hospedagem externa (ex.: Napoleon Host): aponte o DocumentRoot para `backend/public`, configure o PHP 8 + MySQL, suba o `.env` com `DB_*` e `JWT_SECRET`.

## Frontend (local)
1. Copie `frontend/.env.example` para `frontend/.env.local` e ajuste:
   ```
   NEXT_PUBLIC_API_BASE=http://localhost:8001
   NEXT_PUBLIC_ADMIN_OWNER_EMAIL=felippe@luembalagens.com
   ```
   (Quando publicar, use a URL pública do backend, ex.: `https://SEU_DOMINIO/reclamelu-api`.)
2. Instale e rode:
   ```
   cd frontend
   npm install
   npm run dev
   ```
   App em `http://localhost:3000`.

## Variáveis de ambiente importantes
- Frontend: `NEXT_PUBLIC_API_BASE` (URL pública do backend PHP), `NEXT_PUBLIC_ADMIN_OWNER_EMAIL` (email do dono/admin).
- Backend: `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, etc. (ver `backend/.env.example`).

## Comunicação frontend → backend
Defina `NEXT_PUBLIC_API_BASE` para a URL pública da API (ex.: `https://reclamelu.fgembalagens.top/api`). Exemplo de chamada:
```ts
await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```
Em desenvolvimento local, use `http://localhost:8001` se a API estiver rodando nessa porta.

## GitHub – como versionar
No diretório raiz do projeto:
```
git init
git branch -M main
git remote add origin git@github.com:SEU_USUARIO/SEU_REPO.git
git add .
git commit -m "chore: inicializa projeto ReclameLU"
git push -u origin main
```
Para atualizar:
```
git add .
git commit -m "sua mensagem"
git push
```
Para puxar alterações:
```
git pull
```

## Vercel – deploy do frontend (sem rootDirectory no vercel.json)
1. Conecte a Vercel ao seu GitHub e selecione este repositório.
2. No dashboard da Vercel, em “Root Directory”, escolha manualmente a pasta `frontend` (NÃO usar `rootDirectory` no `vercel.json`).
3. Build command: `npm run build`
4. Output directory: `.next`
5. Install command: `npm install` (default).
6. Variáveis de ambiente (Project Settings → Environment Variables):
   - `NEXT_PUBLIC_API_BASE` → URL pública do backend PHP (Napoleon Host).
   - `NEXT_PUBLIC_ADMIN_OWNER_EMAIL` → email do dono/admin.
7. Deploy automático a cada `git push`; Pull Requests geram deploy previews.

### Sobre o `vercel.json`
- Não use `rootDirectory` no `vercel.json` (a Vercel rejeita). Configure a root (`frontend`) só via dashboard.
- Arquivo mínimo válido no **raiz** do repositório:
  ```json
  {
    "version": 2
  }
  ```
  (Opcionalmente, você pode colocar o mesmo `vercel.json` dentro de `frontend/` com apenas `{ "version": 2 }`. Em ambos os casos, a seleção do diretório é feita na Vercel.)
### Como a Vercel detecta o Next.js
- A Vercel identifica o Next.js automaticamente ao apontar a raiz para `frontend`. Não precisa declarar framework no JSON.

## Fluxo de publicação
- **Frontend (Vercel):** `git push` → Vercel builda `frontend/` e publica.
- **Backend (Napoleon Host ou outro):** faça deploy manual via FTP/SSH/git; mantenha `.env` fora do versionamento.
- O frontend consome a API via `NEXT_PUBLIC_API_BASE`.

## Comandos úteis (pt-BR)
- Rodar backend (dev): `php -S localhost:8000 -t public public/index.php`
- Rodar frontend (dev): `npm run dev` (dentro de `frontend`)
- Build frontend local: `npm run build` (dentro de `frontend`)
- Git push: `git add . && git commit -m "mensagem" && git push`
- Ajustar variável na Vercel: Painel do projeto → Settings → Environment Variables → adicionar/editar `NEXT_PUBLIC_API_BASE` e `NEXT_PUBLIC_ADMIN_OWNER_EMAIL`.

## Observações
- Nunca suba arquivos sensíveis (`.env`, `vendor`, `node_modules`) para o Git.
- O backend **não roda** na Vercel; hospede em servidor PHP 8 + MySQL e exponha a URL para o frontend.
- Toda a interface do usuário permanece em português do Brasil.
