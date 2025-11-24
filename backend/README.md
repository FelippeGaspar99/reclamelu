# Backend ReclameLU (API PHP + MySQL) – Guia de Deploy na Napoleon Host

API REST em PHP 8 pronta para rodar em hospedagem compartilhada (Napoleon Host, com phpMyAdmin, FTP e `public_html`). Toda a interface de usuário é em português do Brasil.

## 1) Estrutura de pastas esperada no servidor
Coloque os arquivos públicos em `public_html/reclamelu-api`:
```
public_html/
  reclamelu-api/
    index.php
    .htaccess
```
Coloque o código-fonte em local seguro (fora do `public_html`, se possível), por exemplo:
```
/home/SEU_USUARIO/backend/
  src/
  config/
  migrations/
  vendor/ (se existir)
```
Se a hospedagem não permitir nível acima, mantenha `src/`, `config/` e `migrations/` dentro de `public_html/reclamelu-api/`, preservando o subdiretório `public/` apenas para `index.php` e `.htaccess`.

## 2) Passo a passo de upload
1. **Criar pasta pública:** em `public_html`, crie `reclamelu-api`.
2. **Enviar arquivos públicos:** envie o conteúdo de `backend/public/` (apenas `index.php` e `.htaccess`) para `public_html/reclamelu-api/`.
3. **Enviar código-fonte:** envie `backend/src/`, `backend/config/`, `backend/migrations/` (e `backend/vendor/`, se houver) para `/home/SEU_USUARIO/backend/` ou outra pasta segura.
4. **Ajuste de caminho (se necessário):** caso mova `config/` e `src/` para fora, edite `public/index.php` para apontar para o caminho correto (ex.: `require '/home/SEU_USUARIO/backend/config/database.php';` e autoload em `/home/SEU_USUARIO/backend/src/`).

## 3) Configurar o arquivo de ambiente
1. Copie `config/env.example` para `config/env` no servidor.
2. Edite `config/env` com as credenciais do MySQL remoto:
   ```
   DB_HOST=186.209.113.112
   DB_DATABASE=fgem9000_reclamelu
   DB_USERNAME=fgem9000_reclamelu
   DB_PASSWORD=fgem9000_reclamelu
   JWT_SECRET=<insira_uma_chave_forte_aqui>
   JWT_EXPIRES_MIN=1440
   ```
   - Gere `JWT_SECRET` com ao menos 32–64 caracteres aleatórios.

## 4) Importar o banco pelo phpMyAdmin
1. Acesse o phpMyAdmin da hospedagem.
2. Selecione o banco `fgem9000_reclamelu`.
3. Clique em “Importar” e envie o arquivo `backend/migrations/schema.sql`.
4. Confirme a criação das tabelas.

## 5) Como funciona o `.htaccess`
O arquivo `public/.htaccess` habilita URLs amigáveis:
```
Options -Indexes
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.php [L]
```
Qualquer rota como `/api/complaints` é encaminhada para `index.php`, que carrega o roteador e direciona para o controller.

## 6) Testar a API após o deploy
Exemplo de base pública (ajuste para o seu domínio/IP):
```
Base da API: http://186.209.113.112/reclamelu-api
```
Testes recomendados (via navegador ou curl):
- `GET http://186.209.113.112/reclamelu-api/api/complaints`
- `POST http://186.209.113.112/reclamelu-api/api/login` (enviando email/senha válidos)
- Se existir endpoint de saúde: `GET http://186.209.113.112/reclamelu-api/api/health`

Erros comuns:
- 500 / conexão DB: revise `config/env` (host, usuário, senha) e se o MySQL aceita conexões.
- 404: verifique `.htaccess` e `AllowOverride` habilitado.

## 7) Endpoints principais
- Auth: `POST /api/login`, `GET /api/me`, `POST /api/logout`
- Usuários (admin): CRUD em `/api/users`
- Reclamações: `/api/complaints` (GET/POST/PUT), status/assign (PATCH)
- Métricas:
  - `/api/metrics/days-without-complaints/global`
  - `/api/metrics/days-without-complaints/by-store`
  - `/api/metrics/days-without-complaints/by-type`
  - `/api/metrics/record-days-without-complaints/global`
  - `/api/metrics/record-days-without-complaints/by-store`
  - `/api/metrics/record-days-without-complaints/by-type`

## 8) URL pública da API (exemplo real)
```
Base:   http://186.209.113.112/reclamelu-api
Login:  http://186.209.113.112/reclamelu-api/api/login
Listar: http://186.209.113.112/reclamelu-api/api/complaints
```

## 9) Configurar o frontend
Defina no frontend (Next.js):
```
NEXT_PUBLIC_API_BASE=http://186.209.113.112/reclamelu-api
```
- Desenvolvimento local: em `frontend/.env.local`.
- Produção (Vercel): Settings → Environment Variables.

## 10) Checklist final de deploy
1. Criar `public_html/reclamelu-api`.
2. Enviar `public/index.php` e `.htaccess` para `public_html/reclamelu-api/`.
3. Enviar `src/`, `config/`, `migrations/` (e `vendor/`, se existir) para local seguro (fora do público, se possível).
4. Criar `config/env` com as credenciais do MySQL remoto e `JWT_SECRET` forte.
5. Importar `migrations/schema.sql` no banco `fgem9000_reclamelu` via phpMyAdmin.
6. Testar URLs públicas da API.
7. Configurar `NEXT_PUBLIC_API_BASE` no frontend com a URL pública da API.

## 11) Script de teste de conexão (opcional)
Rodar localmente para checar o acesso ao banco (usa `config/env`):
```
php backend/scripts/test-db.php
```

Pronto! A API estará disponível para o frontend consumir.
