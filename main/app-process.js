const { BrowserWindow } = require("electron");
const path = require("path");

function createAppWindow() {
  let win = new BrowserWindow({
    // width: 1000,
    // height: 600,
    width: 1800,
    height: 1200,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      devTools: true,
    }
  });

  win.loadFile('./renderers/manage_file_path.html');
  win.openDevTools();

  win.on('closed', () => {
    win = null;
  });
}

module.exports = createAppWindow;