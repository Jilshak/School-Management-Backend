import * as fs from 'fs';
import * as path from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';

export class FileUploadUtil {
  static async uploadBase64File(
    base64String: string,
    fileName: string,
    folderName: string
  ): Promise<string> {
    try {
      // Decode the base64 string
      const fileBuffer = Buffer.from(base64String, 'base64');

      // Create the uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
      }

      // Create the specific folder if it doesn't exist
      const folderPath = path.join(uploadsDir, folderName);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Generate a unique filename
      const uniqueFileName = `${path.parse(fileName).name}_${Date.now()}${path.parse(fileName).ext}`;
      const filePath = path.join(folderPath, uniqueFileName);

      // Write the buffer to file
      await fs.promises.writeFile(filePath, fileBuffer);

      return uniqueFileName;
    } catch (error) {
      console.error('File upload error:', error);
      throw new HttpException('Failed to upload file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}