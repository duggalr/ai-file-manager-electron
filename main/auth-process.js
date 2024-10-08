const { BrowserWindow } = require('electron');
const path = require("path");
const authService = require('../services/auth-service');
const createAppWindow = require('../main/app-process');

let win = null;

function createAuthWindow() {
  destroyAuthWin();

  win = new BrowserWindow({
    // width: 1000,
    // height: 600,
    width: 1800,
    height: 1200,
    webPreferences: {
      nodeIntegration: false,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    }
  });

  let authentication_url = authService.getAuthenticationURL();
  console.log('authentication_url:', authentication_url);
  win.loadURL(authentication_url);

  const {session: {webRequest}} = win.webContents;

  const filter = {
    urls: [
      'http://localhost/callback*'
    ]
  };

  webRequest.onBeforeRequest(filter, async ({url}) => {
    await authService.loadTokens(url);
    createAppWindow();
    return destroyAuthWin();
  });

  win.on('authenticated', () => {
    destroyAuthWin();
  });

  win.on('closed', () => {
    win = null;
  });
}

function destroyAuthWin() {
  if (!win) return;
  win.close();
  win = null;
}

function createLogoutWindow() {
  const logoutWindow = new BrowserWindow({
    show: false,
  });

  logoutWindow.loadURL(authService.getLogOutUrl());

  logoutWindow.on('ready-to-show', async () => {
    await authService.logout();
    logoutWindow.close();
  });
}

module.exports = {
  createAuthWindow,
  createLogoutWindow,
};