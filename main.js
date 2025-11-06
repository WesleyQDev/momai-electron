const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const { spawn, exec } = require('child_process')
const path = require('path')
const kill = require('tree-kill')
const net = require('net')
const fs = require('fs')

// Utility function to check if a port is already in use
const isPortTaken = (port) => {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true) // Port is in use
        } else {
          resolve(false) // Other error, assume not in use or handle as needed
        }
      })
      .once('listening', () => {
        tester.once('close', () => { resolve(false) }).close() // Port is free
      })
      .listen(port)
  })
}

// Create lock file to prevent multiple instances
const createLockFile = () => {
  try {
    const lockDir = path.dirname(LOCK_FILE)
    if (!fs.existsSync(lockDir)) {
      fs.mkdirSync(lockDir, { recursive: true })
    }
    fs.writeFileSync(LOCK_FILE, JSON.stringify({
      pid: process.pid,
      timestamp: Date.now(),
      fastapiPid: fastapiProcess?.pid || null,
      facePid: faceProcess?.pid || null
    }))
    return true
  } catch (error) {
    console.error('Failed to create lock file:', error)
    return false
  }
}

// Remove lock file
const removeLockFile = () => {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE)
      console.log('Lock file removed')
    }
  } catch (error) {
    console.error('Failed to remove lock file:', error)
  }
}

// Check if another instance is running
const checkExistingInstance = () => {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const lockData = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8'))
      // Check if the process is still running
      try {
        process.kill(lockData.pid, 0) // Signal 0 doesn't kill, just checks if process exists
        return lockData // Another instance is running
      } catch (e) {
        // Process doesn't exist anymore, remove stale lock file
        fs.unlinkSync(LOCK_FILE)
        return null
      }
    }
    return null
  } catch (error) {
    console.error('Error checking existing instance:', error)
    return null
  }
}

// Utility function to find and kill a process listening on a specific port
const killProcessOnPort = (port) => {
  return new Promise((resolve, reject) => {
    // Command to find process using a port (Windows specific)
    const command = `netstat -ano | findstr LISTENING | findstr :${port}`
    exec(command, (error, stdout, stderr) => {
      if (error || !stdout.trim()) {
        console.log(`No process found on port ${port}`)
        return resolve(false)
      }

      console.log(`netstat stdout for port ${port}:\n${stdout}`)

      const lines = stdout.trim().split('\n')
      const pids = new Set()
      
      // Extract all PIDs using the port
      lines.forEach(line => {
        const parts = line.split(/\s+/)
        const pid = parts[parts.length - 1]
        if (pid && !isNaN(pid)) {
          pids.add(pid)
        }
      })

      if (pids.size === 0) {
        return resolve(false)
      }

      // Kill all processes
      const killPromises = Array.from(pids).map(pid => {
        return new Promise((resolveKill) => {
          console.log(`Killing process ${pid} on port ${port}...`)
          exec(`taskkill /PID ${pid} /F /T`, (killError, killStdout) => {
            if (killError) {
              console.error(`Error killing process ${pid}:`, killError)
            } else {
              console.log(`Process ${pid} killed successfully`)
            }
            resolveKill()
          })
        })
      })

      Promise.all(killPromises).then(() => resolve(true))
    })
  })
}

let fastapiProcess = null
let faceProcess = null
let mainWindow = null
let isQuitting = false
const LOCK_FILE = path.join(app.getPath('userData'), 'server.lock')
const FASTAPI_PORT = 8000

const startBackendProcesses = async () => {
  const pythonPath = path.join(__dirname, 'MomAIv2')

  // Check if another instance is already running
  const existingInstance = checkExistingInstance()
  if (existingInstance) {
    console.error('Another instance of MomAI is already running!')
    console.error('Lock file data:', existingInstance)
    
    // Try to kill the old instance's servers
    console.log('Attempting to clean up previous instance...')
    await killProcessOnPort(FASTAPI_PORT)
    
    // Wait a bit for port to be released
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  // Check if FastAPI port is already in use
  const portInUse = await isPortTaken(FASTAPI_PORT)
  if (portInUse) {
    console.log(`Port ${FASTAPI_PORT} is already in use. Attempting to kill existing process...`)
    try {
      await killProcessOnPort(FASTAPI_PORT)
      // Give some time for the port to be released
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(`Failed to kill process on port ${FASTAPI_PORT}:`, error)
      throw new Error(`Port ${FASTAPI_PORT} is already in use and could not be freed`)
    }
  }
  
  // Inicia o servidor FastAPI
  console.log('Starting FastAPI server...')
  fastapiProcess = spawn('uv', ['run', 'python', '-m', 'uvicorn', 'momai.app:app', '--host', '0.0.0.0', '--port', `${FASTAPI_PORT}`], {
    cwd: pythonPath,
    shell: true,
    detached: false, // Important: don't detach, so it gets killed with parent
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
    fastapiProcess = null
  })

  fastapiProcess.on('error', (error) => {
    console.error('FastAPI process error:', error)
    fastapiProcess = null
  })

  // Inicia o processo de reconhecimento facial
  console.log('Starting Face Recognition process...')
  faceProcess = spawn('uv', ['run', 'python', '-m', 'momai.face_process'], {
    cwd: pythonPath,
    shell: true,
    detached: false, // Important: don't detach, so it gets killed with parent
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
    faceProcess = null
  })

  faceProcess.on('error', (error) => {
    console.error('FaceProcess error:', error)
    faceProcess = null
  })

  // Create lock file after processes are started
  createLockFile()
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

const killAllProcesses = async () => {
  if (isQuitting) {
    console.log('Already quitting, skipping duplicate kill...')
    return false
  }
  
  isQuitting = true
  console.log('Initiating process cleanup...')
  
  const killPromises = []

  // Kill FastAPI process
  if (fastapiProcess && fastapiProcess.pid) {
    console.log(`Killing FastAPI process (PID: ${fastapiProcess.pid})...`)
    killPromises.push(
      new Promise((resolve) => {
        kill(fastapiProcess.pid, 'SIGTERM', (err) => {
          if (err) {
            console.error('Error killing FastAPI with tree-kill:', err)
            // Fallback to taskkill
            exec(`taskkill /PID ${fastapiProcess.pid} /F /T`, (killError) => {
              if (killError) {
                console.error('Error with taskkill for FastAPI:', killError)
              } else {
                console.log('FastAPI killed with taskkill')
              }
              resolve()
            })
          } else {
            console.log('FastAPI process killed successfully')
            resolve()
          }
        })
      })
    )
  }

  // Kill Face process
  if (faceProcess && faceProcess.pid) {
    console.log(`Killing Face process (PID: ${faceProcess.pid})...`)
    killPromises.push(
      new Promise((resolve) => {
        kill(faceProcess.pid, 'SIGTERM', (err) => {
          if (err) {
            console.error('Error killing FaceProcess with tree-kill:', err)
            // Fallback to taskkill
            exec(`taskkill /PID ${faceProcess.pid} /F /T`, (killError) => {
              if (killError) {
                console.error('Error with taskkill for FaceProcess:', killError)
              } else {
                console.log('FaceProcess killed with taskkill')
              }
              resolve()
            })
          } else {
            console.log('FaceProcess killed successfully')
            resolve()
          }
        })
      })
    )
  }

  // Wait for all kills to complete
  await Promise.all(killPromises)
  
  // Extra cleanup: kill any process on the FastAPI port
  console.log('Performing port cleanup...')
  await killProcessOnPort(FASTAPI_PORT)
  
  // Clear process references
  fastapiProcess = null
  faceProcess = null
  
  // Remove lock file
  removeLockFile()
  
  console.log('All processes cleaned up')
  return true
}

// Handle SIGINT and SIGTERM for graceful shutdown when terminated via terminal
const handleGracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Initiating graceful shutdown...`)
  await killAllProcesses()
  process.exit(0)
}

process.on('SIGINT', () => handleGracefulShutdown('SIGINT'))
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'))

// Clean up on uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught exception:', error)
  await killAllProcesses()
  process.exit(1)
})

app.whenReady().then(async () => {
  try {
    await startBackendProcesses()
    
    // Aguarda 4 segundos para o servidor iniciar completamente antes de abrir a janela
    setTimeout(() => {
      createWindow()
    }, 4000)
  } catch (error) {
    console.error('Failed to start backend processes:', error)
    app.quit()
  }
})

// Encerra o processo quando o Electron fechar
app.on('will-quit', async (event) => {
  if (!isQuitting) {
    event.preventDefault()
    await killAllProcesses()
    app.exit(0)
  }
})

app.on('window-all-closed', async () => {
  // Always quit on all platforms and clean up processes
  await killAllProcesses()
  app.quit()
})
