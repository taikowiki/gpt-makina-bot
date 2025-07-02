import { ElectronAPI } from '@electron-toolkit/preload'
import type { IPC } from '../types/ipc'

declare global {
  interface Window {
    electron: ElectronAPI
    api: IPC.FrontAPI
  }
}
