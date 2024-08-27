// main.js

// Modules to control application life and create native browser window
// const { app, BrowserWindow } = require('electron');
const { app, ipcMain, BrowserWindow } = require('electron');
const path = require('node:path');
const { createAuthWindow, createLogoutWindow } = require('./main/auth-process');
const createSplashWindow = require('./main/splash-process');
const createAppWindow = require('./main/app-process');
const authService = require('./services/auth-service');
const apiService = require('./services/api-service');


// const createWindow = () => {

//     // Create the browser window.
//     const mainWindow = new BrowserWindow({
//         width: 800,
//         height: 600,
//         webPreferences: {
//             preload: path.join(__dirname, 'preload.js')
//         }
//     })

//     // TODO: 
//         // do the logic here to display the main screen 
//         // from there, setup the authentication and save in django backend under correct table
//         // create test protected-endpoint that requires token-validation, etc.
//         // implement login/logout
//         // proceed from there to actual app

//     // and load the index.html of the app.
//     mainWindow.loadFile('index.html');

//     // Open the DevTools.
//     mainWindow.webContents.openDevTools();

// }

async function showWindow() {
    try {
        await authService.refreshTokens();
        createAppWindow();
    } catch (err) {
        createAuthWindow();
    }
};

app.on('ready', () => {
    
    // Handle IPC messages from the renderer process.
    ipcMain.handle('auth:get-profile', authService.getProfile);
    ipcMain.handle('api:get-private-data', apiService.getPrivateData);
    ipcMain.on('auth:log-out', () => {
        console.log('logout');
        BrowserWindow.getAllWindows().forEach(window => window.close());
        createLogoutWindow();
    });

    showWindow();

    // var splash = createSplashWindow();
    // setTimeout(function () {
    //     splash.close();
    //     showWindow();
    //     // mainWindow.show();
    // }, 2000);

});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});