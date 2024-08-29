// const { contextBridge, ipcRenderer } = require("electron");

// const electronAPI = {
//   getProfile: () => ipcRenderer.invoke('auth:get-profile'),
//   logOut: () => ipcRenderer.send('auth:log-out'),
//   getPrivateData: () => ipcRenderer.invoke('api:get-private-data'),
// };

// process.once("loaded", () => {
//   contextBridge.exposeInMainWorld('electronAPI', electronAPI);
// });

const { contextBridge, ipcRenderer } = require('electron');

const electronAPI = {
  getProfile: () => ipcRenderer.invoke('auth:get-profile'),
  logOut: () => ipcRenderer.send('auth:log-out'),
  getPrivateData: () => ipcRenderer.invoke('api:get-private-data'),

  getAccessToken: async () => {
    try {
      const accessToken = await ipcRenderer.invoke('auth:get-access-token');
      return accessToken;
    } catch (error) {
      console.error('Failed to get access token:', error);
    }
  },

  redirectToFileView: () => ipcRenderer.send('redirect-to-file-view'),

  redirectToManageFilePath: () => ipcRenderer.send('redirect-to-manage-fp'),

};

process.once('loaded', () => {
  contextBridge.exposeInMainWorld('electronAPI', electronAPI);
});