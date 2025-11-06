# GEMINI.md - MomAI v2

## Project Overview

This project, **MomAI v2**, is a desktop application for Windows built with Electron. It functions as an intelligent personal assistant with a hybrid architecture.

The application consists of:
1.  **Frontend:** An Electron-based user interface built with HTML, CSS, and JavaScript. The UI features a chat interface, status dashboards, a scheduler, and controls for various AI features.
2.  **Backend:** A Python server built with the FastAPI framework. This backend is automatically launched and managed by the Electron main process.

The application is packaged using Electron Forge, and the project's technical documentation is managed with MkDocs, located in the backend repository.

## Building and Running

The project uses `pnpm` for Node.js package management and `uv` for the Python environment.

### 1. Installation

First, install the dependencies for both the frontend and the backend.

**Node.js Dependencies (Frontend):**
```bash
pnpm install
```

**Python Dependencies (Backend):**
```bash
cd MomAIv2
uv sync
cd ..
```

### 2. Running in Development Mode

To run the application for development, use the `start` script from the root directory.

```bash
pnpm start
```

This command launches the Electron window and automatically starts the FastAPI backend.

### 3. Building for Production

To create a distributable package (installers and portable .zip files):

```bash
pnpm run build
```

The output files will be located in the `out/` directory.

## Development Conventions

### Git Repositories

The project is split into two separate Git repositories:

- **Frontend (this project):** `git@github.com:WesleyQDev/momai-electron.git`
- **Backend (sub-project):** `git@github.com:WesleyQDev/MomAI.git`

Changes should be committed and pushed to their respective repositories.

### Commit Style

Commits should follow the **Conventional Commits** specification. Key points:
- Messages must be in **English**.
- Start with a type (e.g., `feat`, `fix`, `docs`, `chore`).
- The subject should be in the imperative mood (e.g., `docs: Add README.md` instead of `docs: Added README.md`).

### Project Documentation

The official project documentation is built using **MkDocs** with the Material theme and is located in the `MomAIv2` (backend) repository.

- The documentation is written in English and translated into Portuguese.
- To view or serve the documentation locally, navigate to the `MomAIv2` directory and use standard MkDocs commands (e.g., `mkdocs serve`).

### Code and Packaging

*   **Backend Code:** All Python source code is located within the `MomAIv2/` directory.
*   **Frontend Code:** The UI is defined in `index.html`, `styles.css`, etc., in the root directory.
*   **Packaging:** `forge.config.js` defines the Electron Forge build configuration. The `MomAIv2` directory is included as an `extraResource` in the final package.