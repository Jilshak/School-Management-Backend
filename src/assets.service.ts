// asset.service.ts
import { Injectable, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class AssetService implements OnModuleInit {
  async onModuleInit() {
    await this.copyAssets();
  } 

  private async copyAssets() {
    const source = path.join(__dirname, 'domains', 'pdfTemplates','billAndReciept.html');
    const destination = path.join(__dirname, 'dist', 'domains', 'pdfTemplates');

    try {
      await fs.copy(source, destination, { overwrite: false });
      console.log('Assets copied successfully!');
    } catch (error) {
      throw new InternalServerErrorException('Failed to copy assets', error.message);
    }
  }
}
