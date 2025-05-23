#!/bin/bash

echo "🔥 FORÇA TOTAL - LIMPEZA CACHE DASHBOARD MAUTIC"
echo "==============================================="

# Navegar para o diretório do projeto
cd /Users/mamprim/dashboardMautic

echo "📁 Verificando diretório atual..."
pwd

echo ""
echo "🛑 1. MATANDO TODOS OS PROCESSOS..."
# Parar TODOS os processos relacionados
pkill -f "vite" || true
pkill -f "react-scripts" || true
pkill -f "npm run dev" || true
pkill -f "firebase emulators" || true
pkill -f "node" || true
sleep 2

echo ""
echo "🔥 2. LIMPEZA ULTRA AGRESSIVA..."

# Limpar cache do Firebase Emulator
echo "   - Firebase Emulator cache..."
firebase emulators:stop > /dev/null 2>&1 || true
rm -rf .firebase/emulators
mkdir -p .firebase/emulators

# Limpar cache do NPM
echo "   - NPM cache..."
npm cache clean --force > /dev/null 2>&1

# Limpar cache do Vite
echo "   - Vite cache..."
rm -rf node_modules/.vite
rm -rf node_modules/.cache
rm -rf dist
rm -rf .vite

# Limpar logs
echo "   - Logs antigos..."
rm -f *.log
rm -f firebase-debug.log
rm -f firestore-debug.log
rm -f database-debug.log

echo ""
echo "🧹 3. LIMPANDO CACHES DO SISTEMA..."
# Limpar cache do sistema (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "   - Cache do Safari..."
    rm -rf ~/Library/Caches/com.apple.Safari/* 2>/dev/null || true
    
    echo "   - Cache do Chrome..."
    rm -rf ~/Library/Caches/Google/Chrome/* 2>/dev/null || true
    
    echo "   - DNS Cache..."
    sudo dscacheutil -flushcache 2>/dev/null || true
fi

echo ""
echo "🚀 4. REINICIANDO FIREBASE EMULATORS..."
# Iniciar emulators com configuração limpa
firebase emulators:start --project devdash-8b926 --clear-data > firebase_emulator.log 2>&1 &

# Aguardar emulators iniciarem
echo "⏳ Aguardando emulators iniciarem (15s)..."
sleep 15

echo ""
echo "🔍 5. VERIFICANDO SE EMULATORS ESTÃO RODANDO..."
if curl -f http://127.0.0.1:5010 > /dev/null 2>&1; then
    echo "✅ Emulator UI está rodando!"
else
    echo "❌ Emulator UI não está rodando - verificar logs"
fi

if curl -f http://127.0.0.1:9099 > /dev/null 2>&1; then
    echo "✅ Auth Emulator está rodando!"
else
    echo "❌ Auth Emulator não está rodando - verificar logs"
fi

echo ""
echo "🎯 6. TESTANDO API EXTERNA..."
echo "Testando conexão com a API de métricas..."
if curl -f -X GET 'https://metrics.devoltaaojogo.com/api/health' \
     -H 'x-api-key: MAaDylN2bs0Y01Ep66' > /dev/null 2>&1; then
    echo "✅ API Externa está respondendo!"
else
    echo "❌ API Externa não está respondendo - verificar conectividade"
fi

echo ""
echo "📊 7. INFORMAÇÕES DO AMBIENTE..."
echo "Node Version: $(node --version)"
echo "NPM Version: $(npm --version)"
echo "Vite Version: $(npx vite --version)"
echo "Firebase CLI Version: $(firebase --version)"

echo ""
echo "🔧 8. COMANDOS PARA EXECUTAR EM OUTRO TERMINAL:"
echo ""
echo "Para iniciar o React (EXECUTE EM OUTRO TERMINAL):"
echo "  cd /Users/mamprim/dashboardMautic"
echo "  npm run dev"
echo ""
echo "Para verificar logs do emulator:"
echo "  tail -f firebase_emulator.log"
echo ""
echo "Para acessar interfaces:"
echo "  - React App: http://localhost:5173"
echo "  - Emulator UI: http://127.0.0.1:5010"
echo "  - Auth Emulator: http://127.0.0.1:9099"
echo "  - Firestore Emulator: http://127.0.0.1:8080"

echo ""
echo "🐛 9. DEBUG APÓS INICIAR:"
echo ""
echo "1. Abra o React em http://localhost:5173"
echo "2. Abra DevTools (F12)"
echo "3. Vá para a aba Network"
echo "4. Filtre por 'api' e 'fetch'"
echo "5. Faça login e observe se os requests têm:"
echo "   - Headers: cache-control: no-cache"
echo "   - Parâmetros únicos: _t, _nc, _nc2"
echo "   - Timestamps diferentes em cada request"

echo ""
echo "✅ LIMPEZA ULTRA AGRESSIVA CONCLUÍDA!"
echo ""
echo "🚨 IMPORTANTE:"
echo "- Os emulators estão rodando em background"
echo "- Execute 'npm run dev' em OUTRO terminal"
echo "- Use Cmd+Shift+R no navegador para force refresh"
echo "- Use o DebugPanel no app para monitorar cache"
echo ""
echo "Se ainda houver problemas:"
echo "1. Verifique logs: tail -f firebase_emulator.log"
echo "2. Verifique Emulator UI: http://127.0.0.1:5010"
echo "3. Use DebugPanel no app para force refresh"
echo "4. Como último recurso: reiniciar o Mac"