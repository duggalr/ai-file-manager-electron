const { app, ipcMain, BrowserWindow } = require('electron');
const { createAuthWindow, createLogoutWindow } = require('./main/auth-process');
const createSplashWindow = require('./main/splash-process');
const createAppWindow = require('./main/app-process');
const authService = require('./services/auth-service');
const apiService = require('./services/api-service');
const axios = require('axios');

const envVariables = require('./env-variables');
const os = require('os');
const keytar = require('keytar');
const keytarService = 'electron-openid-oauth';
const keytarAccount = os.userInfo().username;

const {apiIdentifier, auth0Domain, clientId, clientSecret} = envVariables;


async function showWindow() {
    try {
        await authService.refreshTokens();
        createAppWindow();
    } catch (err) {
        createAuthWindow();
    }
};


ipcMain.handle('auth:get-access-token', async () => {
    
    try {
        const refreshToken = await keytar.getPassword(keytarService, keytarAccount);
        const response = await axios.post(`https://${auth0Domain}/oauth/token`, {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            audience: apiIdentifier,
        });

        const accessToken = response.data.access_token;
        return accessToken;

    } catch (error) {
        console.error('Error fetching access token:', error);
        return null; // Handle error as needed, e.g., return null or throw
    }
});


ipcMain.on('redirect-to-file-view', (event) => {
    const win = BrowserWindow.getFocusedWindow();
    win.loadFile('./renderers/file_view.html');
});


ipcMain.on('redirect-to-manage-fp', (event) => {
    const win = BrowserWindow.getFocusedWindow();
    win.loadFile('./renderers/manage_file_path.html');
});


app.on('ready', () => {
    
    // Handle IPC messages from the renderer process.
    ipcMain.handle('auth:get-profile', authService.getProfile);
    ipcMain.handle('api:get-private-data', apiService.getPrivateData);
    ipcMain.on('auth:log-out', () => {
        console.log('logout');
        // BrowserWindow.getAllWindows().forEach(window => window.close());
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