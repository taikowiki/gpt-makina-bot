import { settingManager } from "./settingManager.svelte";
import { roomManager } from "./roomManager.svelte";
import type { MessageData } from "../../../types/chat";

class ChatManager {
    messageLog: Record<string, MessageData[]> = $state({});

    async sendMessage(message: string) {
        const roomId = roomManager.currentRoomId;
        await this.loadMessageLog(roomId);
        this.messageLog[roomId].push({
            message: { role: 'user', content: message },
            time: new Date(),
            mode: settingManager.mode
        });

        const [err, msg] = await window.api.sendMessage({
            roomId,
            message,
            mode: settingManager.mode
        });

        if (err || !msg) {
            this.messageLog[roomId].push({
                message: { role: 'assistant', content: null },
                time: new Date(),
                mode: settingManager.mode
            });
            return null;
        }
        else {
            this.messageLog[roomId].push({
                message: { role: 'assistant', content: msg },
                time: new Date(),
                mode: settingManager.mode
            });

            return msg;
        }
    }

    async loadMessageLog(roomId: string) {
        if (roomId in this.messageLog) return;
        const messages = await window.api.getMessages(roomId);
        this.messageLog[roomId] = messages;
    }

    async getMessageLog(roomId: string) {
        await this.loadMessageLog(roomId);
        return this.messageLog[roomId];
    }
}

export const chatManager = new ChatManager();