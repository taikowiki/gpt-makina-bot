export namespace IPC{
    export type ToFront = {

    }
    export type ToBack = {
        setApiKey: string;
        setBaseURL: string;
        sendMessage: {
            roomId: string,
            message: string,
            type: 'normal' | 'dark'
        };
    }
    export type FrontAPI = {
        setApiKey: (apiKey: string) => Promise<boolean>,
        setBaseURL: (baseURL: string) => Promise<boolean>,
        sendMessage: (data: ToBack['sendMessage']) => Promise<[Error | null | any, string | null]>;
    };
}