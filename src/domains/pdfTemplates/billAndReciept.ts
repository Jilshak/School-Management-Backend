import * as fs from 'fs';
import * as path from 'path';
import { InternalServerErrorException } from '@nestjs/common';

export async function generatePaymentReciept() {
  try {
    const filePath = path.join(__dirname, '..', 'pdfTemplates', 'billAndReciept.html');
    const html = fs.readFileSync(filePath, 'utf8');
    // console.log(html);
    return html; // Return the HTML or the processed result
  } catch (error) {
    throw new InternalServerErrorException('Failed to generate payment receipt', error.message);
  }
}
