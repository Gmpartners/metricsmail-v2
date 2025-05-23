#!/bin/bash

# Configurar Java
export JAVA_HOME="/opt/homebrew/opt/openjdk@11"
export PATH="$JAVA_HOME/bin:$PATH"

echo "🔥 Iniciando Firebase Emulators..."
echo "Java Version:"
$JAVA_HOME/bin/java -version

cd /Users/mamprim/dashboardMautic

# Iniciar emulators com Java path específico
JAVA_HOME="/opt/homebrew/opt/openjdk@11" npx firebase emulators:start --project devdash-8b926 --only auth,firestore,ui