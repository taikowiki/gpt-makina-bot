import type { BrowserWindow, IpcMain } from "electron";
import { DB } from "./db.js";
import { MakinaGPT } from '@taiko-wiki/manika-bot-gpt';
import { normalPrompt, darkPrompt } from '@taiko-wiki/manika-bot-gpt/devPrompt';
import type { IPC } from '../types/ipc.js';

const initialData = {
    isApiKeySet: false,
    customPrompt: '',
    baseURL: 'https://api.openai.com/v1'
}
let makina = await createMakinaInstance();

export function enableIpc(ipcMain: IpcMain, mainWindow: BrowserWindow) {
    ipcMain.on('ready', (event) => {
        event.returnValue = initialData;
    })

    ipcMain.handle('setApiKey', async (_, apiKey: IPC.ToBack['setApiKey']) => {
        try {
            await DB.func.setting.set('apiKey', apiKey);
            makina.setApiKey(apiKey);
            return true;
        }
        catch {
            return false;
        }
    });

    ipcMain.handle('setBaseURL', async (_, baseURL: IPC.ToBack['setBaseURL']) => {
        try {
            await DB.func.setting.set('baseURL', baseURL);
            makina.setBaseURL(baseURL);
            return true;
        }
        catch {
            return false;
        }
    })

    ipcMain.handle("sendMessage", async (_, { roomId, message, mode }: IPC.ToBack['sendMessage']): Promise<[Error | null | any, string | null]> => {
        try {
            const requestTime = new Date();
            if (!(await DB.func.room.checkRoom(roomId))) {
                const subject = await makina[mode].request([
                    { role: 'developer', content: '유저가 주는 메시지로 시작하는 대화의 주제를 파악하여 간결하게 요약하라. 명사형으로 끝내라.' },
                    { role: 'user', content: message }
                ]).then((res) => res.choices?.[0]?.message?.content ?? '제목 없음');
                await DB.func.room.createRoom(roomId, subject);
                mainWindow.webContents.send("setRoomSubject", { roomId, subject } as IPC.ToFront['setRoomSubject']);
            }

            const recentMessages = await DB.func.msg.getRecentMessages(roomId);
            const response = await makina[mode].run(
                { role: 'user', content: message },
                recentMessages.map(v => ({
                    role: v.message.role,
                    content: v.message.content ?? ''
                })
                ));

            if (response.responseMessage?.message) {
                await DB.func.msg.insertMessage(
                    roomId,
                    {
                        message: { role: 'user', content: message },
                        time: requestTime,
                        mode
                    }
                );
                await DB.func.msg.insertMessage(
                    roomId,
                    {
                        message: response.responseMessage.message,
                        time: new Date(),
                        mode
                    }
                );
                return [null, response.responseMessage.message.content];
            }
            else {
                await DB.func.msg.insertMessage(
                    roomId,
                    {
                        message: { role: 'user', content: message },
                        time: requestTime,
                        mode
                    }
                );
                await DB.func.msg.insertMessage(
                    roomId,
                    {
                        message: { role: 'assistant', content: null },
                        time: new Date(),
                        mode
                    }
                );

                return [null, null];
            }
        }
        catch (err) {
            return [err, null];
        }
    });

    ipcMain.handle('getAllRooms', async () => {
        return await DB.func.room.getAllRooms();
    });

    ipcMain.handle('getMessages', async (_, roomId: string) => {
        return await DB.func.msg.getMessages(roomId);
    })

    ipcMain.handle('setCustomPrompt', async(_, prompt: string) => {
        try{
            await DB.func.setting.set('customPrompt', prompt);
            return true;
        }
        catch{
            return false;
        }
    })
    
    ipcMain.handle('deleteRoom', async(_, roomId) => {
        try{
            await DB.func.room.deleteRoom(roomId);
            return true;
        }
        catch{
            return false;
        }
    })
}

async function createMakinaInstance() {
    const makina = {
        normal: new MakinaGPT({
            key: '',
            developerMessages: [normalPrompt]
        }),
        dark: new MakinaGPT({
            key: '',
            developerMessages: [darkPrompt]
        }),
        custom: new MakinaGPT({
            key: ''
        }),
        setApiKey(apiKey: string) {
            makina.normal.client.apiKey = apiKey;
            makina.dark.client.apiKey = apiKey;
            makina.custom.client.apiKey = apiKey;
            if (apiKey) {
                initialData.isApiKeySet = true;
            }
        },
        setBaseURL(baseURL: string) {
            makina.normal.client.baseURL = baseURL;
            makina.dark.client.baseURL = baseURL;
            makina.custom.client.baseURL = baseURL;
            initialData.baseURL = baseURL;
        },
        setCustomPrompt(prompt: string){
            makina.custom.developerMessages = [prompt];
            initialData.customPrompt = prompt;
        }
    }

    let apiKey = await DB.func.setting.get('apiKey');
    let baseURL = await DB.func.setting.get('baseURL');
    let customPrompt = await DB.func.setting.get('customPrompt');

    if (apiKey) {
        makina.setApiKey(apiKey);
    }
    if (baseURL) {
        makina.setBaseURL(baseURL);
    };
    if(customPrompt){
        makina.setCustomPrompt(customPrompt);
    }

    return makina;
}