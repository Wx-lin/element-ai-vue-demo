import { ConfigService } from '@nestjs/config';
export declare class ChatService {
    private configService;
    private readonly apiUrl;
    constructor(configService: ConfigService);
    chat(message: string, isReasoningEnabled?: boolean): Promise<any>;
}
