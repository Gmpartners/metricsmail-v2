#!/bin/bash

echo "🔥 Firebase Emulators Status Check"
echo "================================="

# Verificar se Firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI não encontrado"
    echo "Para instalar, execute: npm install -g firebase-tools"
    exit 1
else
    echo "✅ Firebase CLI instalado"
fi

# Verificar se está logado no Firebase
if firebase projects:list &> /dev/null; then
    echo "✅ Logado no Firebase"
else
    echo "❌ Não logado no Firebase"
    echo "Para fazer login, execute: firebase login"
    exit 1
fi

# Verificar se os emulators estão rodando
echo "🔍 Verificando emulators..."

# Verificar Auth Emulator (porta 9099)
if curl -f http://127.0.0.1:9099 &> /dev/null; then
    echo "✅ Auth Emulator rodando na porta 9099"
else
    echo "❌ Auth Emulator não está rodando"
fi

# Verificar Firestore Emulator (porta 8080)
if curl -f http://127.0.0.1:8080 &> /dev/null; then
    echo "✅ Firestore Emulator rodando na porta 8080"
else
    echo "❌ Firestore Emulator não está rodando"
fi

echo ""
echo "💡 Para iniciar os emulators:"
echo "   npm run emulator:start"
echo ""
echo "💡 Para rodar o projeto com emulators:"
echo "   npm run dev:emulator"
