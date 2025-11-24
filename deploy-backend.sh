#!/usr/bin/env bash

# Script modelo para empacotar o backend para deploy em hospedagem compartilhada.
# Todos os comentários estão em pt-BR; ajuste host/usuário/caminhos conforme sua conta.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
PACKAGE="$ROOT_DIR/backend-package.tar.gz"

echo "📦 Limpando pacote anterior..."
rm -f "$PACKAGE"

echo "📂 Empacotando backend (exceto public)..."
tar -czf "$PACKAGE" -C "$BACKEND_DIR" config src migrations scripts

echo "📂 Empacotando public (index.php e .htaccess)..."
tar -rzf "$PACKAGE" -C "$BACKEND_DIR/public" .

echo "✅ Pacote gerado: $PACKAGE"
echo
echo "# Exemplo de envio (ajuste host/usuário/caminho):"
echo "# scp backend-package.tar.gz usuario@seu-servidor:/home/SEU_USUARIO/"
echo "# No servidor, extraia:"
echo "#   mkdir -p /home/SEU_USUARIO/backend"
echo "#   tar -xzf backend-package.tar.gz -C /home/SEU_USUARIO/backend"
echo "# Mova os arquivos de public para a pasta pública (ex.: public_html/reclamelu-api):"
echo "#   mv /home/SEU_USUARIO/backend/index.php /home/SEU_USUARIO/backend/.htaccess public_html/reclamelu-api/"
echo "# Ajuste paths em public/index.php se necessário (basePath)."
echo "# Crie/edite config/env no servidor com credenciais e JWT_SECRET forte."
echo "# Importe migrations/schema.sql via phpMyAdmin."
