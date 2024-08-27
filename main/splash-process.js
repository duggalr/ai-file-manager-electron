const { BrowserWindow } = require("electron");
const path = require("path");


function createSplashWindow() {
    var splash = new BrowserWindow({
        width: 1000,
        height: 600,
        // transparent: true, 
        // frame: false, 
        alwaysOnTop: true 
    });

    splash.loadFile('./renderers/splash.html');
    splash.center();
    
    return splash;
    // win.loadFile('./renderers/splash.html');
    // win.on('closed', () => {
    //     win = null;
    // });
}

module.exports = createSplashWindow;