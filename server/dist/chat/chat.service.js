"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let ChatService = class ChatService {
    configService;
    apiUrl = 'https://api.deepseek.com/chat/completions';
    constructor(configService) {
        this.configService = configService;
    }
    async chat(message, isReasoningEnabled = false, attachedFile) {
        const apiKey = this.configService.get('DEEPSEEK_API_KEY');
        if (!apiKey) {
            throw new common_1.HttpException('API Key not configured', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        try {
            let userContent = message;
            if (attachedFile) {
                userContent += `\n\n[附件: ${attachedFile.fileName}]`;
                userContent += `\n图片URL: ${attachedFile.fileUrl}`;
                userContent += `\n请分析这张图片并回答我的问题。`;
            }
            const response = await axios_1.default.post(this.apiUrl, {
                model: isReasoningEnabled ? 'deepseek-reasoner' : 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant. When users upload images, please analyze them and provide helpful insights.'
                    },
                    { role: 'user', content: userContent },
                ],
                stream: true,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                responseType: 'stream',
            });
            return response.data;
        }
        catch (error) {
            console.error('DeepSeek API Error:', error.response?.data || error.message);
            throw new common_1.HttpException(error.response?.data?.error?.message ||
                'Failed to communicate with DeepSeek API', common_1.HttpStatus.BAD_GATEWAY);
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ChatService);
//# sourceMappingURL=chat.service.js.map