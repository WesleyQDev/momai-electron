# GEMINI.md - MomAI v2

## Project Overview

This project, **MomAI v2**, is a desktop application for Windows built with Electron. It functions as an intelligent personal assistant with a hybrid architecture.

The application consists of:
1.  **Frontend:** An Electron-based user interface built with HTML, CSS, and JavaScript. The UI features a chat interface, status dashboards for notifications and WhatsApp messages, a scheduler, and controls for features like facial recognition and voice synthesis.
2.  **Backend:** A Python server built with the FastAPI framework. This backend is automatically launched and managed by the Electron main process.

The application is packaged using Electron Forge, which bundles the Node.js frontend and the Python backend into a single distributable installer or portable executable.

## Building and Running

The project uses `pnpm` for Node.js package management and `uv` for the Python environment.

### 1. Installation

First, install the dependencies for both the frontend and the backend.

**Node.js Dependencies:**
```bash
pnpm install
```

**Python Dependencies:**
```bash
cd MomAIv2
uv sync
cd ..
```

### 2. Running in Development Mode

To run the application for development, use the `start` script. This will launch the Electron window and the FastAPI server with hot-reloading enabled for the frontend.

```bash
pnpm start
```
The Electron main process (`main.js`) automatically starts the FastAPI backend.

### 3. Building for Production

To create a distributable package (installers and portable .zip files), use the `build` script.

```bash
pnpm run build
```

The output files will be located in the `out/` directory, structured by maker (e.g., `out/make/squirrel.windows` for the installer).

## Development Conventions

*   **Backend Code:** All Python backend source code is located within the `MomAIv2/` directory.
*   **Frontend Code:** The frontend UI is defined in `index.html`, `styles.css`, and `scheduler-styles.css`.
*   **Electron Main Process:** The entry point for the Electron application is `main.js`. This file handles window creation and manages the lifecycle of the Python backend process.
*   **Packaging:** `forge.config.js` contains the configuration for Electron Forge. It specifies build targets, icons, and which files to include or ignore. The `MomAIv2` directory is included as an `extraResource` in the final package.
*   **Communication:** The frontend communicates with the backend via WebSocket (`ws://localhost:8000/ws`) for real-time updates and standard HTTP requests for other actions.
