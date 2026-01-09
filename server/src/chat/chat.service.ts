import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ChatService {
  private readonly apiUrl = 'https://api.deepseek.com/chat/completions';

  constructor(private configService: ConfigService) {}

  async chat(message: string, isReasoningEnabled: boolean = false, attachedFile?: any): Promise<any> {
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    if (!apiKey) {
      throw new HttpException(
        'API Key not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      // 构建用户消息内容
      let userContent = message;
      if (attachedFile) {
        userContent += `\n\n[附件: ${attachedFile.fileName}]`;
        userContent += `\n图片URL: ${attachedFile.fileUrl}`;
        userContent += `\n请分析这张图片并回答我的问题。`;
      }

      const response = await axios.post(
        this.apiUrl,
        {
          model: isReasoningEnabled ? 'deepseek-reasoner' : 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant. When users upload images, please analyze them and provide helpful insights.'
            },
            { role: 'user', content: userContent },
          ],
          stream: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          responseType: 'stream',
        },
      );

      return response.data;
    } catch (error) {
      console.error(
        'DeepSeek API Error:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        error.response?.data?.error?.message ||
          'Failed to communicate with DeepSeek API',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
