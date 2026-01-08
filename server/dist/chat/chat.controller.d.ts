import { ChatService } from './chat.service';
import type { Response } from 'express';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    chat(message: string, res: Response): Promise<void>;
}
