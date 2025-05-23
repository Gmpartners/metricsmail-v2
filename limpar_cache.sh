#!/bin/bash

echo "🔧 LIMPANDO CACHE DO DASHBOARD MAUTIC"
echo "====================================="

# Navegar para o diretório do projeto
cd /Users/mamprim/dashboardMautic

echo "📁 Verificando diretório atual..."
pwd

echo ""
echo "🛑 1. Parando processos existentes..."
# Parar qualquer processo React/Vite rodando
pkill -f "vite"
pkill -f "react-scripts"
pkill -f "npm run dev"

echo ""
echo "🔥 2. Limpando cache do Firebase Emulator..."
# Parar emulators do Firebase
firebase emulators:stop > /dev/null 2>&1 || true

# Limpar dados do emulator (mantendo as configurações)
rm -rf .firebase/emulators
mkdir -p .firebase/emulators

echo ""
echo "🗑️ 3. Limpando cache do Node/NPM..."
# Limpar cache do npm
npm cache clean --force

echo ""
echo "🧹 4. Limpando cache do Vite..."
# Limpar cache do Vite
rm -rf node_modules/.vite
rm -rf dist

echo ""
echo "🌐 5. Limpando cache do navegador..."
echo "   - Chrome: Cmd+Shift+R ou Cmd+Option+R"
echo "   - Firefox: Ctrl+Shift+R ou Cmd+Shift+R"
echo "   - Safari: Cmd+Option+R"

echo ""
echo "🔄 6. Verificando dados do usuário específico..."
echo "User ID: KvqAecb6LoEqV7y64VPNrf8KlvFN"

echo ""
echo "🚀 7. Reiniciando Firebase Emulators..."
# Iniciar emulators em background
firebase emulators:start --project devdash-8b926 > firebase_emulator.log 2>&1 &

# Aguardar emulators iniciarem
echo "⏳ Aguardando emulators iniciarem..."
sleep 10

echo ""
echo "🎯 9. Comandos para debug adicional..."
echo ""
echo "Para verificar logs do emulator:"
echo "  tail -f firebase_emulator.log"
echo ""
echo "Para acessar Emulator UI:"
echo "  open http://127.0.0.1:5010"
echo ""
echo "Para testar API manualmente:"
echo "  curl -X GET 'https://metrics.devoltaaojogo.com/api/users/KvqAecb6LoEqV7y64VPNrf8KlvFN/accounts' \\"
echo "       -H 'x-api-key: MAaDylN2bs0Y01Ep66'"
echo ""
echo "Para iniciar o React (em outro terminal):"
echo "  npm run dev"

echo ""
echo "✅ LIMPEZA DE CACHE CONCLUÍDA!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Abra um novo terminal"
echo "2. Execute: npm run dev"
echo "3. Acesse: http://localhost:5173"
echo "4. Faça login com o usuário: KvqAecb6LoEqV7y64VPNrf8KlvFN"
echo "5. Verifique se os dados aparecem corretamente"
echo ""
echo "Se ainda houver problemas:"
echo "- Verifique o Emulator UI: http://127.0.0.1:5010"
echo "- Verifique os logs: tail -f firebase_emulator.log"
echo "- Force refresh no navegador: Cmd+Shift+R"