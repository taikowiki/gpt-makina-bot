export type Room = {
    roomId: string;
    subject: string;
}

export type MessageData = {
    message: {
        role: 'user' | 'assistant',
        content: string | null
    },
    time: Date
}