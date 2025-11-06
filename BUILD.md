# 🚀 Build do MomAI v2

Este guia explica como fazer o build do aplicativo MomAI v2 usando Electron Forge.

## 📋 Pré-requisitos

1. **Node.js** (v18 ou superior)
2. **pnpm** (instalado)
3. **Python** e **uv** (para o backend)
4. **Ícone .ico** para Windows (recomendado)

## 🔧 Instalação das Dependências

```bash
pnpm install
```

## 🏗️ Comandos de Build

### Desenvolvimento
```bash
pnpm start
```

### Build Completo (Instalador + ZIP)
```bash
pnpm run build
```

### Build Apenas para Windows
```bash
pnpm run build:win
```

### Package (sem instalador)
```bash
pnpm run package
```

## 📦 O que será gerado

Após executar `pnpm run build`, você encontrará na pasta `out/`:

### Windows:
- `out/make/squirrel.windows/x64/` - Instalador .exe (Setup)
- `out/make/zip/win32/x64/` - Arquivo .zip portável

### Estrutura:
```
out/
├── make/
│   ├── squirrel.windows/
│   │   └── x64/
│   │       └── MomAI-Setup.exe  ← Instalador principal
│   └── zip/
│       └── win32/
│           └── x64/
│               └── MomAI-win32-x64-1.0.0.zip  ← Versão portável
└── MomAI-win32-x64/  ← Aplicativo empacotado
```

## 📝 Notas Importantes

### 1. Ícone do Aplicativo
- O build procura por `assets/icon.ico` para Windows
- Se não existir um `.ico`, converta o PNG existente
- Tamanho recomendado: 256x256px

### 2. Backend Python Incluído
- A pasta `MomAIv2` é incluída automaticamente no build
- Certifique-se de que o ambiente Python está configurado
- O app usará `uv` para executar o backend

### 3. Arquivos Ignorados
O build ignora automaticamente:
- `.git/`
- `node_modules/.cache/`
- `.venv/`
- `__pycache__/`
- `.pytest_cache/`
- Arquivos `.md`

## 🔍 Troubleshooting

### Erro: "icon.ico not found"
Crie um ícone .ico a partir do PNG:
```bash
# Use ferramentas online ou ImageMagick
convert assets/icon.png -define icon:auto-resize=256,128,96,64,48,32,16 assets/icon.ico
```

### Erro: "Cannot find module"
Reinstale as dependências:
```bash
pnpm install
```

### Build muito grande
Verifique se os arquivos estão sendo ignorados corretamente no `forge.config.js`

### O instalador não funciona
1. Verifique se tem permissões de administrador
2. Desative o antivírus temporariamente
3. Confira se o código está assinado (opcional)

## 🎯 Distribuição

### Instalador (.exe)
- Melhor para usuários finais
- Instalação automática
- Cria atalhos no Menu Iniciar

### ZIP Portável
- Não requer instalação
- Pode rodar de um pendrive
- Requer extração manual

## 🔐 Assinatura de Código (Opcional)

Para assinar o executável (recomendado para distribuição):

1. Obtenha um certificado de assinatura de código
2. Configure as variáveis de ambiente:
```bash
$env:CERTIFICATE_FILE="caminho/para/certificado.pfx"
$env:CERTIFICATE_PASSWORD="sua-senha"
```

3. Execute o build:
```bash
pnpm run build
```

## 📊 Tamanho Estimado

- **Instalador**: ~150-300 MB
- **ZIP**: ~200-350 MB
- **Instalado**: ~400-600 MB

O tamanho varia dependendo do Python e dependências incluídas.

## ✅ Checklist Antes do Build

- [ ] Todas as dependências instaladas (`pnpm install`)
- [ ] Backend Python funcionando (`cd MomAIv2 && uv sync`)
- [ ] Ícone .ico criado (opcional mas recomendado)
- [ ] Versão atualizada no `package.json`
- [ ] Testado com `pnpm start`
- [ ] Código commitado no git

## 🚀 Build Rápido

```bash
# 1. Instalar dependências
pnpm install

# 2. Fazer build
pnpm run build

# 3. Testar o instalador
cd out/make/squirrel.windows/x64
.\MomAI-Setup.exe
```

---

**Dica**: Para builds mais rápidos durante desenvolvimento, use `pnpm run package` que gera apenas o executável sem instalador.
