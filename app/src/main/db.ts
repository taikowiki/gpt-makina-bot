import sqlite3 from 'sqlite3';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { MessageData, Room } from '../types/chat.js';

const { Database } = sqlite3;

const dbDirPath = path.join(process.resourcesPath, 'db');
const dbPath = path.join(dbDirPath, 'main.db');
if (!fs.existsSync(dbDirPath)) {
    fs.mkdirSync(dbDirPath, { recursive: true });
}

const DB = {
    db: new Database(dbPath),
    run(sql: string, params?: any[]) {
        return new Promise((res, rej) => {
            DB.db.run(sql, params ?? [], function (err) {
                if (err) {
                    return rej(err);
                }
                return res(this);
            })
        })
    },
    all(sql: string, params?: any[]) {
        return new Promise((res, rej) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    return rej(err);
                }
                return res(rows);
            })
        })
    },
    get(sql: string, params?: any[]) {
        return new Promise((res, rej) => {
            this.db.get(sql, params, (err, rows) => {
                if (err) {
                    return rej(err);
                }
                return res(rows);
            })
        })
    },
    func: {
        setting: {
            async get(key: string) {
                const result = await DB.get("SELECT value FROM setting WHERE key=?", [key]);
                if (!result) {
                    return null;
                }
                return Object.values(result)[0] as string;
            },
            async set(key: string, value: string) {
                await DB.run("INSERT OR REPLACE INTO setting (key, value) VALUES (?, ?)", [key, value]);
            },
            async check() {
                const result = await DB.get("SELECT name FROM sqlite_master WHERE type='table' AND name='setting'");
                return Boolean(result);
            },
            async create() {
                await DB.run(`CREATE TABLE "setting" (
                    id INTEGER PRIMARY KEY,
                    "key"	TEXT NOT NULL UNIQUE,
                    "value"	TEXT DEFAULT NULL
                );`)
            }
        },
        msg: {
            async insertMessage(roomId: string, messageData: MessageData) {
                await DB.run("INSERT INTO message (roomId, message, time, mode) VALUES (?, ?, ?, ?)", [roomId, JSON.stringify(messageData.message), messageData.time.getTime(), messageData.mode]);
            },
            async getRecentMessages(roomId: string, limit: number = 10, offset: number = 0) {
                const result = await DB.all("SELECT * FROM message WHERE roomId=? ORDER BY id DESC LIMIT ? OFFSET ? ", [roomId, limit, offset]) as any[];
                result.forEach((v: any) => {
                    v.message = JSON.parse(v.message);
                    v.time = new Date(v.time);
                });
                return result as (MessageData & {roomId: string})[];
            },
            async getMessages(roomId: string) {
                const result = await DB.all("SELECT message, time, mode FROM message WHERE roomId=? ORDER BY id ASC", [roomId]) as any[];
                result.forEach((v: any) => {
                    v.message = JSON.parse(v.message);
                    v.time = new Date(v.time);
                });
                return result as MessageData[];
            },
            async check() {
                const result = await DB.get("SELECT name FROM sqlite_master WHERE type='table' AND name='message'");
                return Boolean(result);
            },
            async create() {
                await DB.run(`CREATE TABLE "message" (
                    id INTEGER PRIMARY KEY,
                    "roomId"	TEXT NOT NULL,
                    "message"	TEXT NOT NULL,
                    "time"	INTEGER NOT NULL,
                    "mode"  TEXT NOT NULL
                );`)
            }
        },
        room: {
            async checkRoom(roomId: string) {
                const result = await DB.get("SELECT roomId FROM room WHERE roomId=?", [roomId]);
                return Boolean(result);
            },
            async createRoom(roomId: string, subject: string) {
                await DB.run("INSERT INTO room (roomId, subject) VALUES (?, ?)", [roomId, subject]);
            },
            async getRoom(roomId: string) {
                const result = await DB.get("SELECT roomId, subject FROM room WHERE roomId=?", [roomId]);
                if (result) {
                    return result as Room;
                }
                return null;
            },
            async getAllRooms() {
                const result = await DB.all("SELECT roomId, subject FROM room");
                return result ?? [] as Room[];
            },
            async deleteRoom(roomId: string){
                await DB.run("DELETE FROM room WHERE roomId=?", [roomId]);
            },
            async check() {
                const result = await DB.get("SELECT name FROM sqlite_master WHERE type='table' AND name='room'");
                return Boolean(result);
            },
            async create() {
                await DB.run(`CREATE TABLE "room" (
                    id INTEGER PRIMARY KEY,
                    "roomId"	TEXT NOT NULL UNIQUE,
                    "subject"	TEXT NOT NULL
                );`)
            }
        }
    }
};

if (!(await DB.func.setting.check())) {
    await DB.func.setting.create();
}
if (!(await DB.func.msg.check())) {
    await DB.func.msg.create();
}
if (!(await DB.func.room.check())) {
    await DB.func.room.create();
}

export { DB };