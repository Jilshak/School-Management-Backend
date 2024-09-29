import * as fs from 'fs';
import * as path from 'path';
import { InternalServerErrorException } from '@nestjs/common';

interface PaymentData {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface School {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
}

export async function generateReciept(
  data: PaymentData[],
  dueDate: Date,
  paymentMode: string,
  address: string,
  className: string,
  name: string,
  school: School,
  paymentId: string,
) {
  try {
    const totalAmount = data.reduce(
      (acc, item) => acc + item.unitPrice * item.quantity,
      0,
    );
    const filePath = path.join(
      __dirname,
      '..',
      'pdfTemplates',
      'billAndReciept.html',
    );
    const rows = `<tr>
          <td>[index]</td>
          <td>[name]</td>
          <td>[des]</td>
          <td>[count]</td>
          <td>[unitPrice]</td>
          <td>[totalPrice]</td>
        </tr>`
    let row = '';
    data.forEach((item,i) => {
         row =row+ rows.replace('[index]', i+1+"")
        .replace('[name]', item.name)
        .replace('[count]', item.quantity+"")
        .replace('[des]', item.description)
        .replace('[unitPrice]', item.unitPrice+"")
        .replace('[totalPrice]', item.quantity*item.unitPrice+"")
    })
    let html = fs.readFileSync(filePath, 'utf8');
    html = html
      .replace('{rows}', row)
      .replace('{due-date}', dueDate.toLocaleDateString())
      .replace('{payment-mode}', paymentMode)
      .replace('{total-amount}', totalAmount.toString())
      .replace('{address}', address)
      .replace('{class}', className)
      .replace('{name}', name)
      .replace('{school-name}', school.name)
      .replace('{school-address}', school.address)
      .replace('{school-phone}', school.phone)
      .replace('{school-email}', school.email)
      .replace('{school-logo}', school.logo)
      .replace('{receipt-date}', new Date().toLocaleDateString())
      .replace('{payment-id}', paymentId.toUpperCase())
   
    return html; // Return the HTML or the processed result
  } catch (error) {
    throw new InternalServerErrorException(
      'Failed to generate payment receipt',
      error.message,
    );
  }
}
