# MetricsMail v2 - Dashboard de Métricas de Email Marketing

## 📋 Descrição do Projeto

Dashboard completo para análise de métricas de email marketing desenvolvido com React + Firebase. Este é um sistema de monitoramento e análise que permite visualizar estatísticas detalhadas de campanhas de email.

**Migrado de:** `dashboardMautic` → `metricsmail-v2`

## 🚀 Tecnologias Utilizadas

- **Frontend:** React + Vite
- **Backend:** Firebase (Auth + Firestore)
- **Styling:** Tailwind CSS
- **API:** Integração com API de métricas externa
- **Deploy:** Firebase Hosting

## 🔧 Configuração do Ambiente

### Firebase (Desenvolvimento Local)
```bash
# Project ID
devdash-8b926

# Emulators
Auth: 127.0.0.1:9099
Firestore: 127.0.0.1:8080
UI: 127.0.0.1:5010
```

### API de Métricas
```bash
# Base URL
https://metrics.devoltaaojogo.com

# API Key
MAaDylN2bs0Y01Ep66
```

## 🏃‍♂️ Como Executar

### Pré-requisitos
- Node.js (versão 18+)
- npm ou yarn
- Firebase CLI

### Instalação
```bash
# Clone o repositório
git clone https://github.com/Gmpartners/metricsmail-v2.git
cd metricsmail-v2

# Instale as dependências
npm install

# Configure o ambiente
cp .env.development .env.local
```

### Executar em Desenvolvimento
```bash
# Opção 1: Executar com emulators automaticamente
npm run dev:emulator

# Opção 2: Executar separadamente
# Terminal 1: Iniciar Firebase Emulators
npx firebase emulators:start

# Terminal 2: Iniciar React App
npm run dev
```

### URLs de Desenvolvimento
- **App:** http://localhost:5173
- **Firebase Emulator UI:** http://127.0.0.1:5010

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes reutilizáveis
│   ├── auth/            # Componentes de autenticação
│   ├── charts/          # Gráficos e visualizações
│   ├── common/          # Componentes comuns
│   ├── form/            # Formulários
│   ├── header/          # Cabeçalho
│   ├── tables/          # Tabelas
│   └── ui/              # Componentes de UI
├── contexts/            # Contextos React
│   ├── AuthContext.jsx  # Contexto de autenticação
│   └── MetricsContext.jsx # Contexto de métricas
├── firebase/            # Configurações Firebase
│   ├── config.js        # Config desenvolvimento
│   └── config.prod.js   # Config produção
├── hooks/               # Hooks customizados
├── layout/              # Layouts da aplicação
├── pages/               # Páginas da aplicação
│   ├── Authentication/  # Login/Signup
│   ├── Dashboard/       # Dashboard principal
│   ├── Metrics.jsx      # Página de métricas
│   └── Settings/        # Configurações
├── services/            # Serviços e APIs
│   └── MetricsMailApiService.js
└── icons/               # Ícones SVG
```

## 🔐 Autenticação

O sistema utiliza Firebase Authentication com:
- Login com email/senha
- Registro de novos usuários
- Contexto de autenticação global
- Persistência de sessão

## 📊 Funcionalidades

### Dashboard Principal
- Visualização de métricas em tempo real
- Gráficos interativos
- Filtros por período
- Estatísticas consolidadas

### Métricas Disponíveis
- Emails enviados
- Taxa de abertura
- Taxa de clique
- Taxa de bounce
- Conversões
- ROI das campanhas

### Recursos Adicionais
- Interface responsiva
- Tema claro/escuro
- Exportação de dados
- Notificações em tempo real

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                 # Iniciar apenas React
npm run dev:emulator       # Iniciar React + Firebase Emulators

# Build
npm run build              # Build para produção
npm run preview            # Preview do build

# Firebase
firebase emulators:start   # Iniciar emulators
firebase deploy            # Deploy para produção

# Utilitários
./start_emulators.sh       # Script para iniciar emulators
./restart_no_cache.sh      # Restart sem cache
./limpar_cache.sh          # Limpar cache
```

## 🌐 Deploy

### Desenvolvimento
O projeto roda localmente com Firebase Emulators para desenvolvimento isolado.

### Produção
```bash
# Build e deploy
npm run build
firebase deploy
```

## 🔑 Variáveis de Ambiente

Criar arquivo `.env.local`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_METRICS_API_URL=https://metrics.devoltaaojogo.com
VITE_METRICS_API_KEY=MAaDylN2bs0Y01Ep66
```

## 📝 Changelog

### v2.0.0 (Atual)
- Migração completa do dashboardMautic
- Refatoração da arquitetura de componentes
- Implementação de contextos React
- Integração com Firebase Emulators
- Sistema de autenticação robusto
- Interface modernizada com Tailwind CSS

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte:
- Abra uma [Issue](https://github.com/Gmpartners/metricsmail-v2/issues)
- Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido com ❤️ pela equipe GM Partners**
