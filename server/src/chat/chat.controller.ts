import { Controller, Post, Body, Res } from '@nestjs/common';
import { ChatService } from './chat.service';
import type { Response } from 'express';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body('message') message: string, @Res() res: Response) {
    const stream = await this.chatService.chat(message);
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    stream.pipe(res);
  }
}
