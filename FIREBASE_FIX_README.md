# 🔥 Firebase SignUp Error - Guia de Correção

## 🚨 **PROBLEMA IDENTIFICADO**
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
Firebase: Error (auth/network-request-failed)
```

**Causa:** O projeto está configurado para usar Firebase Emulators em desenvolvimento, mas eles não estão rodando.

---

## ⚡ **SOLUÇÕES RÁPIDAS**

### **1. SOLUÇÃO IMEDIATA (Usar Firebase Produção)**
```bash
# Já configurado! Apenas execute:
npm run dev
```
✅ **Arquivo `.env` já foi criado com `VITE_USE_EMULATOR=false`**

### **2. SOLUÇÃO COMPLETA (Com Emulators)**

#### **Instalar Firebase CLI (se necessário):**
```bash
npm install -g firebase-tools
```

#### **Fazer login no Firebase:**
```bash
firebase login
```

#### **Iniciar Emulators e Projeto:**
```bash
# Opção 1: Tudo junto
npm run dev:emulator

# Opção 2: Separado
npm run emulator:start    # Terminal 1
npm run dev              # Terminal 2
```

---

## 🔧 **VERIFICAR STATUS DOS EMULATORS**

### **Windows (PowerShell):**
```powershell
.\check-emulators.ps1
```

### **Linux/Mac:**
```bash
chmod +x check-emulators.sh
./check-emulators.sh
```

---

## 🎛️ **ALTERNAR ENTRE MODOS**

### **Para usar Firebase Produção:**
Edite o arquivo `.env`:
```env
VITE_USE_EMULATOR=false
```

### **Para usar Emulators Locais:**
Edite o arquivo `.env`:
```env
VITE_USE_EMULATOR=true
```

---

## 🚀 **TESTE RÁPIDO**

1. **Execute o projeto:**
   ```bash
   npm run dev
   ```

2. **Acesse:** http://localhost:5173

3. **Teste o SignUp** - agora deve funcionar!

---

## 📊 **PORTAS DOS EMULATORS**
- **Auth Emulator:** http://127.0.0.1:9099
- **Firestore Emulator:** http://127.0.0.1:8080
- **Firebase UI:** http://127.0.0.1:5010

---

## ❓ **TROUBLESHOOTING**

### **Se ainda houver erro:**
1. Verifique se não há outros processos usando as portas 8080/9099
2. Reinicie os emulators: `Ctrl+C` e execute novamente
3. Limpe o cache: `npm run dev -- --clear-cache`

### **Dados dos emulators são perdidos?**
Sim, os emulators usam dados temporários. Para produção, use `VITE_USE_EMULATOR=false`