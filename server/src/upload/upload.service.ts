import { Injectable } from '@nestjs/common';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * 文件信息接口
 */
export interface FileInfo {
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileExt: string;
  mimeType: string;
  uploadTime: Date;
}

/**
 * 文件上传服务
 * 处理文件保存和信息管理
 */
@Injectable()
export class UploadService {
  /**
   * 保存上传的文件并返回文件信息
   * @param file Multer文件对象
   * @returns 文件信息
   */
  async saveFile(file: Express.Multer.File): Promise<FileInfo> {
    // 生成唯一的文件ID
    const fileId = uuidv4();

    // 获取文件扩展名
    const fileExt = extname(file.originalname).toLowerCase();

    // 构建文件URL（相对于服务器根目录）
    const fileUrl = `/uploads/${file.filename}`;

    // 创建文件信息对象
    const fileInfo: FileInfo = {
      fileId,
      fileName: file.originalname,
      fileUrl,
      fileSize: file.size,
      fileExt: fileExt.replace('.', ''), // 移除点号
      mimeType: file.mimetype,
      uploadTime: new Date(),
    };

    // 这里可以将文件信息保存到数据库
    // 暂时只返回文件信息
    console.log('File saved:', fileInfo);

    return fileInfo;
  }

  /**
   * 验证文件类型
   * @param file 文件对象
   * @returns 是否为有效的图片文件
   */
  private isValidImageFile(file: Express.Multer.File): boolean {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    return allowedMimes.includes(file.mimetype);
  }

  /**
   * 验证文件大小
   * @param file 文件对象
   * @param maxSize 最大文件大小（字节）
   * @returns 是否在允许的大小范围内
   */
  private isValidFileSize(
    file: Express.Multer.File,
    maxSize: number = 10 * 1024 * 1024,
  ): boolean {
    return file.size <= maxSize;
  }
}
