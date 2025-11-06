module.exports = {
  packagerConfig: {
    name: 'MomAI',
    executableName: 'MomAI',
    icon: './assets/icon',
    asar: true,
    ignore: [
      /^\/\.git($|\/)/,
      /^\/node_modules\/\.cache($|\/)/,
      /^\/out($|\/)/,
      /^\/\.vscode($|\/)/,
      /^\/\.idea($|\/)/,
      /\.md$/,
      /^\/MomAIv2\/\.venv($|\/)/,
      /^\/MomAIv2\/__pycache__($|\/)/,
      /^\/MomAIv2\/\.pytest_cache($|\/)/,
      /^\/MomAIv2\/build($|\/)/,
      /^\/MomAIv2\/dist($|\/)/,
      /^\/MomAIv2\/\.ruff_cache($|\/)/
    ],
    extraResource: [
      './MomAIv2'
    ],
    appBundleId: 'com.momai.app',
    appCategoryType: 'public.app-category.productivity',
    win32metadata: {
      CompanyName: 'Wesley',
      FileDescription: 'MomAI - Assistente Pessoal Inteligente',
      ProductName: 'MomAI',
      InternalName: 'MomAI'
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'MomAI',
        authors: 'Wesley',
        description: 'MomAI v2 - Assistente Pessoal Inteligente com IA',
        // setupIcon: './assets/icon.ico',  // Descomente quando tiver o .ico
        // iconUrl: 'https://raw.githubusercontent.com/yourusername/momai/main/assets/icon.ico',
        setupExe: 'MomAI-Setup.exe',
        noMsi: true,
        certificateFile: process.env.CERTIFICATE_FILE,
        certificatePassword: process.env.CERTIFICATE_PASSWORD
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32', 'darwin', 'linux'],
      config: {}
    }
  ],
  publishers: [],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {}
    }
  ]
};
