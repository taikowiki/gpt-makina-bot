import { TaikowikiApi } from '@taiko-wiki/taikowiki-api';
export const GENRE = ["pops", "anime", "kids", "game", "variety", "namco", "vocaloid", "classic"] as const;
type Genre = typeof GENRE[number];
import OpenAI from 'openai';

const wiki = new TaikowikiApi();

export class MakinaGPT {
    client: OpenAI;
    developerMessages: string[] = MakinaGPT.developerMessages;

    constructor(option: MakinaGPT.ConstrcutorOption) {
        if (option.url) {
            this.client = new OpenAI({
                baseURL: option.url,
                apiKey: option.key,
                dangerouslyAllowBrowser: option.dangerouslyAllowBrowser
            })
        }
        else {
            this.client = new OpenAI({
                apiKey: option.key,
                dangerouslyAllowBrowser: option.dangerouslyAllowBrowser
            })
        }

        if(option.developerMessages){
            this.developerMessages = option.developerMessages;
        }
    }

    async request(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
        return await this.client.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                ...this.developerMessages.map((e) => ({
                    role: 'developer' as const,
                    content: e
                })),
                ...messages
            ],
            tools: MakinaGPT.tools
        })
    }

    async run(message: OpenAI.Chat.Completions.ChatCompletionMessageParam, formerMessages?: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
        if (!formerMessages) {
            formerMessages = [];
        }
        formerMessages.push(message);
        while (true) {
            try {
                const response = await this.request([...formerMessages]);
                if (!response.choices?.[0]) {
                    return {
                        responseMessage: null,
                        formerMessages
                    }
                }

                // tool 요청이 아니면 함수 종료
                const responseMessage = response.choices[0];
                if (responseMessage.finish_reason !== "tool_calls") {
                    return {
                        responseMessage,
                        formerMessages
                    }
                }

                const toolCalls = responseMessage.message.tool_calls;
                if (!toolCalls) {
                    return {
                        responseMessage: null,
                        formerMessages
                    }
                }

                const toolResults = await this.handleToolCalls(toolCalls);
                formerMessages.push(responseMessage.message, ...toolResults);
            }
            catch (err) {
                throw err;
            }
        }
    }

    async handleToolCalls(toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]) {
        const toolResults: OpenAI.Chat.Completions.ChatCompletionToolMessageParam[] = [];
        for (const toolCall of toolCalls) {
            if (!(toolCall.function.name in MakinaGPT.toolFunctions)) {
                toolResults.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: 'null'
                });
            }

            const toolFunction = MakinaGPT.toolFunctions[toolCall.function.name as keyof typeof MakinaGPT.toolFunctions];
            const content = await toolFunction(JSON.parse(toolCall.function.arguments));

            toolResults.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content
            });
        }
        return toolResults;
    }
}

export namespace MakinaGPT {
    export const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
        {
            type: 'function',
            function: {
                name: 'getSongData',
                description: 'taiko.wiki에서 곡 번호로 상세한 곡 데이터 가져오기',
                parameters: {
                    type: 'object',
                    properties: {
                        songNo: {
                            type: 'string',
                            description: '곡번호'
                        }
                    },
                    required: ['songNo']
                }
            }
        },
        {
            type: 'function',
            function: {
                name: 'getSongData',
                description: 'taiko.wiki에서 곡 번호로 상세한 곡 데이터 가져오기',
                parameters: {
                    type: 'object',
                    properties: {
                        songNo: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: '곡 번호 배열'
                        }
                    },
                    required: ['songNo']
                }
            }
        },
        {
            type: 'function',
            function: {
                name: 'songSearch',
                description: 'taiko.wiki에서 곡 검색하기. query, genre, difficulty, level로 검색 가능',
                parameters: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: '키워드'
                        },
                        genre: {
                            type: 'string',
                            enum: GENRE
                        },
                        difficulty: {
                            type: 'string',
                            enum: ['easy', 'normal', 'hard', 'oni', 'ura', 'oniura']
                        },
                        level: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 10
                        }
                    },
                    required: []
                }
            }
        },
        {
            type: 'function',
            function: {
                name: 'getDiffchart',
                description: 'taiko.wiki에서 서열표 검색 기능',
                parameters: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            enum: ['clear', 'fc', 'dfc']
                        },
                        level: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 10
                        }
                    },
                    required: ['type', 'level']
                }
            }
        },
        {
            type: 'function',
            function: {
                name: 'getDaniVersions',
                description: '단위도장 버전들을 가져옴'
            }
        },
        {
            type: 'function',
            function: {
                name: 'getDani',
                description: '특정 버전의 단위도장 데이터를 가져옴',
                parameters: {
                    type: 'object',
                    properties: {
                        version: {
                            type: 'string'
                        }
                    },
                    required: ['version']
                }
            }
        }
    ];

    export const toolFunctions = {
        async getSongData({ songNo }: { songNo: string }) {
            try {
                const response = await wiki.song(songNo);
                return JSON.stringify(response);
            }
            catch (err: any) {
                return 'null';
            }
        },
        async getSongDatas({ songNo }: { songNo: string[] }) {
            try {
                const response = await wiki.song(songNo);
                return JSON.stringify(response);
            }
            catch (err: any) {
                return 'null';
            }
        },
        async songSearch(param: Partial<MakinaGPT.Tools.SongSearchParam>) {
            try {
                const response = await wiki.songSearch(param);
                return JSON.stringify(response);
            }
            catch (err: any) {
                return 'null';
            }
        },
        async getDiffchart(param: MakinaGPT.Tools.GetDiffchartParam){
            try{
                const response = await wiki.diffchart(param.type, param.level);
                return JSON.stringify(response);
            }
            catch(err){
                return 'null';
            }
        },
        async getDaniVersions(){
            try{
                const response = await wiki.daniVersions();
                return JSON.stringify(response);
            }
            catch(err){
                return 'null';
            }
        },
        async getDani({version}: MakinaGPT.Tools.GetDaniParam){
            try{
                const response = await wiki.dani(version);
                return JSON.stringify(response);
            }
            catch(err){
                return 'null';
            }
        }
    }

    export const developerMessages: string[] = [];
}

export namespace MakinaGPT {
    export type ConstrcutorOption = {
        key: string;
        url?: string;
        developerMessages?: string[],
        dangerouslyAllowBrowser?: boolean
    }

    export namespace Tools {
        export type GetSongDataParam = {
            songNo: string;
        }
        export type SongSearchParam = {
            query: string,
            genre: Genre,
            difficulty: 'easy' | 'normal' | 'hard' | 'oni' | 'ura' | 'oniura',
            level: number
        }
        export type GetDiffchartParam = {
            type: 'clear' | 'fc' | 'dfc',
            level: number
        }
        export type GetDaniParam = {
            version: string
        }
    }
}