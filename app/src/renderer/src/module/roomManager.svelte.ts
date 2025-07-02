import type { Room } from "../../../types/chat";
import type { IPC } from "../../../types/ipc";

class RoomManager {
    static async getInstance() {
        const roomManager = new RoomManager();
        const rooms = await window.api.getAllRooms();
        roomManager.roomIds.push(...rooms.map(e => e.roomId));
        rooms.forEach((room) => {
            roomManager.roomMap[room.roomId] = room;
        });
        if(rooms.length === 0){
            roomManager.newRoom();
        }
        return roomManager;
    }

    roomIds: string[] = $state([]);
    roomMap: Record<string, Room> = $state({});
    currentRoomId = $state<string | undefined>();

    constructor() {
        window.electron.ipcRenderer.on('setRoomSubject', (_, { roomId, subject }: IPC.ToFront['setRoomSubject']) => {
            const room = this.roomMap[roomId];
            if (!room) return;
            room.subject = subject;
        })
    }

    setCurrentRoom(roomId: string) {
        this.currentRoomId = roomId;
    }

    newRoom(){
        let roomId: string;
        while(true){
            roomId = crypto.randomUUID();
            if(!(roomId in this.roomMap)){
                break;
            }
        }

        const room: Room = {
            roomId,
            subject: '새 채팅'
        };

        this.roomIds.push(room.roomId);
        this.roomMap[roomId] = room;
        this.setCurrentRoom(roomId);

        return roomId;
    }
}

export const roomManager = await RoomManager.getInstance();