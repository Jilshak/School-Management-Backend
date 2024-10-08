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
      // Extract the file type and extension from the base64 string
      const { fileType, extension } = FileUploadUtil.getFileTypeFromBase64(base64String);

      // Remove the data:image/png;base64 part if it exists
      const base64Data = base64String.replace(/^data:.*?;base64,/, "");

      // Decode the base64 string
      const fileBuffer = Buffer.from(base64Data, 'base64');

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

      // Generate a unique filename with the correct extension
      const uniqueFileName = `${path.parse(fileName).name}_${Date.now()}.${extension}`;
      const filePath = path.join(folderPath, uniqueFileName);

      // Write the buffer to file
      await fs.promises.writeFile(filePath, fileBuffer);

      return uniqueFileName;
    } catch (error) {
      console.error('File upload error:', error);
      throw new HttpException('Failed to upload file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private static getFileTypeFromBase64(base64String: string): { fileType: string, extension: string } {
    // Check if the base64 string starts with a file extension
    const extensionMatch = base64String.match(/^(\w+):/);
    if (extensionMatch) {
      const extension = extensionMatch[1].toLowerCase();
      return { fileType: `image/${extension}`, extension };
    }

    // If no extension prefix, check for the standard base64 prefix
    const match = base64String.match(/^data:([A-Za-z-+\/]+);base64,/);
    
    if (match) {
      const fileType = match[1];
      let extension = 'bin';  // Default extension

      switch (fileType) {
        case 'image/jpeg':
          extension = 'jpg';
          break;
        case 'image/png':
          extension = 'png';
          break;
        case 'image/gif':
          extension = 'gif';
          break;
        case 'application/pdf':
          extension = 'pdf';
          break;
        case 'application/msword':
          extension = 'doc';
          break;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          extension = 'docx';
          break;
        case 'application/vnd.ms-excel':
          extension = 'xls';
          break;
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          extension = 'xlsx';
          break;
        // Add more cases as needed
      }

      return { fileType, extension };
    }

    // If no match, assume it's a binary file
    return { fileType: 'application/octet-stream', extension: 'bin' };
  }
}