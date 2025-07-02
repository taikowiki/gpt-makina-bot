import { MessageData, Room } from "./chat.js";

export namespace IPC{
    export type ToFront = {
        setRoomSubject: {
            roomId: string;
            subject: string;
        }
    }
    export type ToBack = {
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
    }
    export type FrontAPI = {
        ready: () => {
            isApiKeySet: boolean;
        },
        setApiKey: (apiKey: string) => Promise<boolean>,
        setBaseURL: (baseURL: string) => Promise<boolean>,
        sendMessage: (data: ToBack['sendMessage']) => Promise<[Error | null | any, string | null]>,
        getAllRooms: () => Promise<Room[]>;
        getMessages: (roomId: string) => Promise<MessageData[]>;
    };
}