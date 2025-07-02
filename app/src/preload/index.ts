import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC } from '../types/ipc.js'

// Custom APIs for renderer
const api: IPC.FrontAPI = {
  setApiKey(apiKey: string): Promise<boolean> {
    return electronAPI.ipcRenderer.invoke('setApiKey', apiKey);
  },
  setBaseURL(baseURL){
    return electronAPI.ipcRenderer.invoke('setBaseURL', baseURL);
  },
  sendMessage(data){
    return electronAPI.ipcRenderer.invoke('sendMessage', data);
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
