import { ChatModel } from "openai/resources";
import { MessageData, Room } from "./chat.js";

export namespace IPC{
    export interface ToFront{
        setRoomSubject: {
            roomId: string;
            subject: string;
        }
    }
    export interface ToBack{
        ready: void;
        setApiKey: string;
        setBaseURL: string;
        sendMessage: {
            roomId: string,
            message: string,
            mode: 'normal' | 'dark' | 'custom'
        };
        getAllRooms: void;
        getMessages: string;
        setCustomPrompt: string;
        deleteRoom: string;
    }
    export interface FrontAPI{
        ready: () => {
            isApiKeySet: boolean;
            customPrompt: string;
            baseURL: string;
            model: ChatModel
        },
        setApiKey: (apiKey: string) => Promise<boolean>,
        setBaseURL: (baseURL: string) => Promise<boolean>,
        sendMessage: (data: ToBack['sendMessage']) => Promise<[Error | null | any, string | null]>,
        getAllRooms: () => Promise<Room[]>;
        getMessages: (roomId: string) => Promise<MessageData[]>;
        setCustomPrompt: (prompt: string) => Promise<boolean>;
        deleteRoom: (roomId: string) => Promise<boolean>;
        setModel: (model: ChatModel) => Promise<boolean>;
    };
}