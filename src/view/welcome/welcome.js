'use strict'

// import { app, BrowserWindow } from 'electron'
// import { url } from 'inspector';
const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const url = require('url')
const Vue = require('vue')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/welcome.html`

function createWindow () {
  /**
     * Initial window options
     */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(
    // winURL
    url.format({
      pathname: path.join(__dirname, 'welcome.html'),
      protocol: 'file:',
      slashes: true
    })
  )

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

new Vue({
  el: '#app',
  data: {
    welcomeStr: 'Hello Vue.js!'
  }
})
