# MomAI v2 - Electron App

Este é o repositório principal para o aplicativo de desktop **MomAI v2**, construído com Electron. Ele serve como a interface do usuário (frontend) e gerencia o backend Python.

## Visão Geral

O aplicativo é uma interface de desktop para o MomAI, um assistente pessoal inteligente. Ele fornece uma interface de bate-papo, painéis de status para notificações e mensagens do WhatsApp, e um gerenciador de agendamentos.

A arquitetura é híbrida:
- **Frontend**: Electron, HTML, CSS, JavaScript.
- **Backend**: Um servidor Python (FastAPI) localizado no subdiretório `MomAIv2`, que é gerenciado como um repositório separado.

## Como Executar

### 1. Instalação

O projeto usa `pnpm` para gerenciamento de pacotes Node.js.

```bash
pnpm install
```

**Nota:** As dependências do backend (`MomAIv2`) também precisam ser instaladas. Consulte o `README.md` dentro desse diretório para mais detalhes.

### 2. Modo de Desenvolvimento

Para iniciar o aplicativo em modo de desenvolvimento:

```bash
pnpm start
```

Este comando iniciará o aplicativo Electron e o servidor backend Python automaticamente.

### 3. Build de Produção

Para criar um instalador ou um pacote portátil para distribuição:

```bash
pnpm run build
```

Os arquivos de saída serão gerados no diretório `out/`.
