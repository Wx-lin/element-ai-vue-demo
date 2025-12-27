import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ChatService {
  private readonly apiUrl = 'https://api.deepseek.com/chat/completions';

  constructor(private configService: ConfigService) {}

  async chat(message: string) {
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    if (!apiKey) {
      throw new HttpException(
        'API Key not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: message },
          ],
          stream: false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );

      return { reply: response.data.choices[0].message.content };
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
