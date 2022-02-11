import { EVENTS, environment, preferences, EventBus, Logger } from 'remoteit-headless'
import AutoUpdater from './AutoUpdater'
import electron, { Menu, dialog } from 'electron'
import TrayMenu from './TrayMenu'
import debug from 'debug'
import path from 'path'

const d = debug('r3:headless:ElectronApp')

const DEEP_LINK_PROTOCOL = 'remoteit'
const DEEP_LINK_PROTOCOL_DEV = 'remoteitdev'

export default class ElectronApp {
  public app: electron.App
  public tray?: electron.Tray
  private window?: electron.BrowserWindow
  private autoUpdater: AutoUpdater
  private quitSelected: boolean
  private isMaximized: boolean
  private openAtLogin?: boolean
  private deepLinkUrl?: string
  private authCallback?: boolean
  private protocol: string

  constructor() {
    this.app = electron.app
    this.quitSelected = false
    this.isMaximized = false
    this.autoUpdater = new AutoUpdater()
    this.protocol = process.env.NODE_ENV === 'development' ? DEEP_LINK_PROTOCOL_DEV : DEEP_LINK_PROTOCOL

    if (!this.app.requestSingleInstanceLock()) {
      Logger.warn('ANOTHER APP INSTANCE IS RUNNING. EXITING.')
      this.app.quit()
    }
    this.app.setAsDefaultProtocolClient(this.protocol)
    Logger.info('ELECTRON STARTING UP', { version: electron.app.getVersion() })

    // Windows event
    this.app.on('ready', this.handleAppReady)
    this.app.on('activate', this.handleActivate)
    this.app.on('before-quit', () => (this.quitSelected = true))
    this.app.on('second-instance', this.handleSecondInstance)
    this.app.on('open-url', this.handleOpenUrl)

    EventBus.on(EVENTS.preferences, this.handleOpenAtLogin)
    EventBus.on(EVENTS.filePrompt, this.handleFilePrompt)
    EventBus.on(EVENTS.maximize, this.handleMaximize)
    EventBus.on(EVENTS.open, this.openWindow)
  }

  check = () => {
    if (!environment.isHeadless) this.autoUpdater.check()
  }

  get url() {
    if (!this.window) return
    return this.window.webContents.getURL()
  }

  /**
   * This method will be called when Electron has finished
   * initialization and is ready to create browser windows.
   * Some APIs can only be used after this event occurs.
   */
  private handleAppReady = () => {
    this.setDeepLink(process.argv.pop())
    this.createSystemTray()
    this.createMainWindow()
    this.handleOpenAtLogin(preferences.data || {})
    this.openWindow()
    EventBus.emit(EVENTS.ready, this.tray)
  }

  private handleSecondInstance = (_: electron.Event, argv: string[]) => {
    // Windows deep link support
    Logger.info('SECOND INSTANCE ARGS', { argv })
    this.setDeepLink(argv.pop())
    this.openWindow()
  }

  private handleOpenUrl = (event: electron.Event, url: string) => {
    // Mac deep link support
    event.preventDefault()
    this.setDeepLink(url)
    this.openWindow()
  }

  private handleMaximize = () => {
    if (this.isMaximized) {
      this.window?.unmaximize()
      this.isMaximized = false
    } else {
      this.window?.maximize()
      this.isMaximized = true
    }
  }

  private handleFilePrompt = async () => {
    if (!this.window) return

    const result = await dialog.showOpenDialog(this.window, {
      title: 'Find application',
      message: 'Select the application location',
      buttonLabel: 'Select',
    })

    EventBus.emit(EVENTS.filePath, result.filePaths[0])
    Logger.info('FILE PROMPT RESULT', { result })
  }

  private setDeepLink(link?: string) {
    const scheme = this.protocol + '://'
    const authCallbackCode = 'authCallback'
    if (link?.includes(scheme)) {
      this.deepLinkUrl = link.substring(scheme.length)
      Logger.info('SET DEEP LINK', { url: this.deepLinkUrl })
    }
    if (link?.includes(authCallbackCode)) {
      this.authCallback = true
      Logger.info('Auth Callback', { link })
    }
  }

  private handleActivate = () => {
    this.openWindow()
  }

  private handleOpenAtLogin = ({ openAtLogin }: IPreferences) => {
    d('Handling open at login:', openAtLogin)
    if (this.openAtLogin !== openAtLogin) {
      this.app.setLoginItemSettings({ openAtLogin })
    }
    this.openAtLogin = openAtLogin
  }

  private createMainWindow = () => {
    d('Create main window')
    if (this.window) return
    this.app.setAppUserModelId('it.remote.desktop')

    this.window = new electron.BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 525,
      minHeight: 325,
      icon: path.join(__dirname, 'images/icon-64x64.png'),
      titleBarStyle: 'hiddenInset',
      frame: !environment.isMac,
      autoHideMenuBar: true,
      webPreferences: { preload: path.join(__dirname, 'preload.js') },
    })

    this.window.setVisibleOnAllWorkspaces(true)

    const startUrl = this.getStartUrl()

    this.window.loadURL(startUrl)

    this.window.on('close', event => {
      d('Window closed')
      if (!this.quitSelected) {
        event.preventDefault()
        this.closeWindow()
      }
    })

    this.window.webContents.on('will-prevent-unload', event => {
      // Don't allow stripe to prevent unload (it tries to stop to confirm changes)
      event.preventDefault()
    })

    this.window.webContents.setWindowOpenHandler(({ url }) => {
      Logger.info('OPEN EXTERNAL URL', { url })
      electron.shell.openExternal(url)
      return { action: 'deny' }
    })

    this.window.webContents.on('will-navigate', (event, url) => {
      if (url.includes('auth.remote.it')) {
        Logger.info('AUTH NAVIGATION DETECTED')
        event.preventDefault()
        electron.shell.openExternal(url)
      }
    })

    this.logWebErrors()
  }

  private logWebErrors = () => {
    if (!this.window) return
    const { webContents } = this.window
    webContents.on('render-process-gone', (event, details) => {
      Logger.error('ELECTRON WEB CONSOLE render-process-gone', { details })
      this.reload()
    })
    webContents.on('unresponsive', () => Logger.warn('ELECTRON WEB CONSOLE unresponsive'))
    webContents.on('responsive', () => Logger.warn('ELECTRON WEB CONSOLE responsive'))
    webContents.on('plugin-crashed', (event, name, version) =>
      Logger.error('ELECTRON WEB CONSOLE plugin-crashed', { name, version })
    )
    webContents.on('preload-error', (event, preloadPath, error) =>
      Logger.error('ELECTRON WEB CONSOLE preload-error', { preloadPath, error })
    )
    webContents.on('console-message', (event, level, message, line, sourceId) => {
      if (level > 2) Logger.error('ELECTRON WEB console error', { level, message, line, sourceId })
    })
  }

  private reload() {
    const lastWindow = this.window
    this.window = undefined
    this.createMainWindow()
    lastWindow?.destroy()
  }

  private getStartUrl(): string {
    return process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'http://localhost:29999'
  }

  private createSystemTray() {
    Logger.info('CREATE SYSTEM TRAY')

    const iconFile = environment.isMac
      ? 'iconTemplate.png'
      : environment.isWindows
      ? 'iconwin.ico'
      : environment.isPi
      ? 'iconLinuxColor.png'
      : 'iconLinux.png'
    const iconPath = path.join(__dirname, 'images', iconFile)
    this.tray = new electron.Tray(iconPath)
    new TrayMenu(this.tray)
    const defaultMenu = Menu.getApplicationMenu()
    const items = defaultMenu?.items.filter(item => item.role !== 'help')
    const menu = Menu.buildFromTemplate(items || [])
    Menu.setApplicationMenu(menu)
  }

  private openWindow = (location?: string, openDevTools?: boolean) => {
    if (!this.window || !this.tray) return
    d('Showing window')

    if (!this.window.isVisible()) {
      this.setWindowPosition()
      if (this.app.dock) this.app.dock.show()
    }

    this.window.show()

    if (this.deepLinkUrl) {
      location = this.deepLinkUrl
      this.deepLinkUrl = undefined
    }

    if (location && this.authCallback) {
      this.authCallback = false
      const index = location.indexOf('?')
      let fullUrl = this.getStartUrl()
      if (index != -1) {
        const parameters = location.substring(index)
        fullUrl = fullUrl + parameters
      }
      Logger.info('Opening', { url: fullUrl })
      this.window.loadURL(fullUrl)
    } else if (location) {
      Logger.info('Open location', { location })
      this.window.webContents.executeJavaScript(`window.location.hash="#/${location}"`)
    }

    if (openDevTools) this.window.webContents.openDevTools({ mode: 'detach' })
  }

  private closeWindow() {
    if (this.window) this.window.hide()
    if (this.app.dock) this.app.dock.hide()
  }

  private setWindowPosition() {
    if (!this.window || !this.tray) return

    const padding = 12
    const window = this.window.getBounds()
    const tray = this.tray.getBounds()
    const display = electron.screen.getDisplayMatching(tray).bounds

    let position = {
      x: Math.round(display.x + display.width / 2 - window.width / 2),
      y: Math.round(display.y + display.height / 2 - window.height / 2),
    }

    // out of bounds check
    const windowRightEdge = position.x + window.width
    const displayRightEdge = display.x + display.width - padding
    const overlap = displayRightEdge - windowRightEdge
    if (overlap < 0) position.x += overlap

    this.window.setPosition(position.x, position.y)
  }
}
