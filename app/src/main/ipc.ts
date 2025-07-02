import type { IpcMain } from "electron";
import { DB } from "./db.js";
import { MakinaGPT } from '@taiko-wiki/manika-bot-gpt';
import { normalPrompt, darkPrompt } from '@taiko-wiki/manika-bot-gpt/devPrompt';
import type { IPC } from '../types/ipc.js';
import { ChatCompletionMessageParam } from "openai/resources";

const makina = await createMakinaInstance();
const messageInsertManager = createMessageInsertManager();

export function enableIpc(ipcMain: IpcMain) {
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

    ipcMain.handle("sendMessage", async (_, { roomId, message, type }: IPC.ToBack['sendMessage']): Promise<[Error | null | any, string | null]> => {
        try {
            if (!(await DB.func.room.checkRoom(roomId))) {
                const subject = await makina[type].request([
                    { role: 'developer', content: '유저가 주는 메시지로 시작하는 대화의 주제를 파악하여 간결하게 요약하라.' },
                    { role: 'user', content: message }
                ]).then((res) => res.choices?.[0]?.message?.content ?? '제목 없음');
                await DB.func.room.createRoom(roomId, subject);
            }

            const recentMessages = await DB.func.msg.getRecentMessages(roomId);
            const response = await makina[type].run(
                { role: 'user', content: message },
                recentMessages.map(v => v.message)
            )

            response.progressMessages.forEach((message) => {
                messageInsertManager.push({
                    roomId,
                    message,
                    time: new Date()
                });
            });
            if (response.responseMessage?.message) {
                messageInsertManager.push({
                    roomId, 
                    message: response.responseMessage.message, 
                    time: new Date()
                })
                return [null, response.responseMessage.message.content];
            }

            return [null, null];
        }
        catch (err) {
            return [err, null];
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
        setApiKey(apiKey: string) {
            makina.normal.client.apiKey = apiKey;
            makina.dark.client.apiKey = apiKey;
        },
        setBaseURL(baseURL: string) {
            makina.normal.client.baseURL = baseURL;
            makina.dark.client.baseURL = baseURL;
        }
    }

    let apiKey = await DB.func.setting.get('apiKey');
    let baseURL = await DB.func.setting.get('baseURL');

    if (apiKey) {
        makina.setApiKey(apiKey);
    }
    if (baseURL) {
        makina.setBaseURL(baseURL);
    };

    return makina;
}

function createMessageInsertManager() {
    const MessageInsertManager = class {
        working: boolean = false;
        queue: { roomId: string, message: ChatCompletionMessageParam, time: Date }[] = [];

        push(data: { roomId: string, message: ChatCompletionMessageParam, time: Date }) {
            this.queue.push(data);
            this.run();
        }
        async run() {
            if (this.working) return;
            if (this.queue.length <= 0) return;
            this.working = true;
            while (true) {
                const data = this.queue.shift();
                if (!data) break;
                const { roomId, message, time } = data;
                await DB.func.msg.insertMessage(roomId, message, time);
            }
            this.working = false;
        }
    };
    return new MessageInsertManager();
}

