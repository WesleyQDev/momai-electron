const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const { spawn } = require('child_process')
const path = require('path')
const kill = require('tree-kill')

let fastapiProcess = null
let faceProcess = null
let mainWindow = null

const startBackendProcesses = () => {
  const pythonPath = path.join(__dirname, 'MomAIv2')
  
  // Inicia o servidor FastAPI
  fastapiProcess = spawn('uv', ['run', 'python', '-m', 'uvicorn', 'momai.app:app', '--host', '0.0.0.0', '--port', '8000'], {
    cwd: pythonPath,
    shell: true,
    env: { ...process.env }
  })

  fastapiProcess.stdout.on('data', (data) => {
    console.log(`FastAPI: ${data}`)
  })

  fastapiProcess.stderr.on('data', (data) => {
    console.error(`FastAPI Error: ${data}`)
  })

  fastapiProcess.on('close', (code) => {
    console.log(`FastAPI process exited with code ${code}`)
  })

  // Inicia o processo de reconhecimento facial
  faceProcess = spawn('uv', ['run', 'python', '-m', 'momai.face_process'], {
    cwd: pythonPath,
    shell: true,
    env: { ...process.env }
  })

  faceProcess.stdout.on('data', (data) => {
    console.log(`FaceProcess: ${data}`)
  })

  faceProcess.stderr.on('data', (data) => {
    console.error(`FaceProcess Error: ${data}`)
  })

  faceProcess.on('close', (code) => {
    console.log(`FaceProcess exited with code ${code}`)
  })
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 950,
    height: 600,
    frame: false,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    backgroundColor: '#0d0d0d',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })
  Menu.setApplicationMenu(null);
  
  // Adiciona atalho F12 para abrir DevTools
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      mainWindow.webContents.toggleDevTools();
    }
  });
  
  // Eventos de maximizar/desmaximizar
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized');
  });
  
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-unmaximized');
  });
  
  mainWindow.loadFile('index.html')
}

// IPC handlers para controlar a janela
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

app.whenReady().then(() => {
  startBackendProcesses()
  
  // Aguarda 4 segundos para o servidor iniciar completamente antes de abrir a janela
  setTimeout(() => {
    createWindow()
  }, 4000)
})

// Encerra o processo FastAPI quando o Electron fechar
app.on('before-quit', (event) => {
  if (fastapiProcess && fastapiProcess.pid) {
    console.log('Killing FastAPI process before quit...');
    event.preventDefault();
    kill(fastapiProcess.pid, 'SIGTERM', (err) => {
      if (err) {
        console.error('Error killing FastAPI process before quit:', err);
      } else {
        console.log('FastAPI process killed before quit.');
      }
      fastapiProcess = null;
      
      // Kill faceProcess as well
      if (faceProcess && faceProcess.pid) {
        console.log('Killing FaceProcess before quit...');
        kill(faceProcess.pid, 'SIGTERM', (err) => {
          if (err) {
            console.error('Error killing FaceProcess before quit:', err);
          } else {
            console.log('FaceProcess killed before quit.');
          }
          faceProcess = null;
          app.quit();
        });
      } else {
        app.quit();
      }
    });
  } else if (faceProcess && faceProcess.pid) {
    console.log('Killing FaceProcess before quit...');
    event.preventDefault();
    kill(faceProcess.pid, 'SIGTERM', (err) => {
      if (err) {
        console.error('Error killing FaceProcess before quit:', err);
      } else {
        console.log('FaceProcess killed before quit.');
      }
      faceProcess = null;
      app.quit();
    });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (fastapiProcess && fastapiProcess.pid) {
      console.log('Killing FastAPI process...');
      kill(fastapiProcess.pid, 'SIGTERM', (err) => {
        if (err) {
          console.error('Error killing FastAPI process:', err);
        } else {
          console.log('FastAPI process killed.');
        }
        fastapiProcess = null;
        
        // Kill faceProcess as well
        if (faceProcess && faceProcess.pid) {
          console.log('Killing FaceProcess...');
          kill(faceProcess.pid, 'SIGTERM', (err) => {
            if (err) {
              console.error('Error killing FaceProcess:', err);
            } else {
              console.log('FaceProcess killed.');
            }
            faceProcess = null;
            app.quit();
          });
        } else {
          app.quit();
        }
      });
    } else if (faceProcess && faceProcess.pid) {
      console.log('Killing FaceProcess...');
      kill(faceProcess.pid, 'SIGTERM', (err) => {
        if (err) {
          console.error('Error killing FaceProcess:', err);
        } else {
          console.log('FaceProcess killed.');
        }
        faceProcess = null;
        app.quit();
      });
    } else {
      app.quit();
    }
  }
});
