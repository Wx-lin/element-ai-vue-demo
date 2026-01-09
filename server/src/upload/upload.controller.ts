import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

/**
 * 文件上传控制器
 * 处理文件上传请求并返回文件信息
 */
@Controller('api/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * 上传单个文件
   * @param file 上传的文件
   * @returns 文件信息
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    // 检查文件是否存在
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    try {
      // 处理文件上传
      const fileInfo = await this.uploadService.saveFile(file);

      return {
        success: true,
        data: fileInfo,
        message: 'File uploaded successfully',
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw new HttpException(
        error.message || 'File upload failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
