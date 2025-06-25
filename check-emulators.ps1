# Firebase Emulators Status Check - PowerShell Version

Write-Host "🔥 Firebase Emulators Status Check" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow

# Verificar se Firebase CLI está instalado
try {
    $firebaseVersion = firebase --version 2>$null
    Write-Host "✅ Firebase CLI instalado: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI não encontrado" -ForegroundColor Red
    Write-Host "Para instalar, execute: npm install -g firebase-tools" -ForegroundColor Cyan
    exit 1
}

# Verificar se está logado no Firebase
try {
    firebase projects:list 2>$null | Out-Null
    Write-Host "✅ Logado no Firebase" -ForegroundColor Green
} catch {
    Write-Host "❌ Não logado no Firebase" -ForegroundColor Red
    Write-Host "Para fazer login, execute: firebase login" -ForegroundColor Cyan
    exit 1
}

# Verificar se os emulators estão rodando
Write-Host "🔍 Verificando emulators..." -ForegroundColor Yellow

# Verificar Auth Emulator (porta 9099)
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:9099" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Auth Emulator rodando na porta 9099" -ForegroundColor Green
} catch {
    Write-Host "❌ Auth Emulator não está rodando" -ForegroundColor Red
}

# Verificar Firestore Emulator (porta 8080)
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8080" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Firestore Emulator rodando na porta 8080" -ForegroundColor Green
} catch {
    Write-Host "❌ Firestore Emulator não está rodando" -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 Para iniciar os emulators:" -ForegroundColor Cyan
Write-Host "   npm run emulator:start" -ForegroundColor White
Write-Host ""
Write-Host "💡 Para rodar o projeto com emulators:" -ForegroundColor Cyan
Write-Host "   npm run dev:emulator" -ForegroundColor White