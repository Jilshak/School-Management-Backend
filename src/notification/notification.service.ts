import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as serviceAccount from '../../fcmAccountCredentials.json'; // Adjust the path to your downloaded JSON file

@Injectable()
export class NotificationService {
  constructor() {
    if (!admin.apps.length) {
        // Initialize Firebase Admin SDK only if it hasn't been initialized yet
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        });
      }
  }

  async sendNotification(token: string, title: string, body: string): Promise<void> {
    const message = {
      token: token,
      notification: {
        title: title,
        body: body,
      },
      data: {
        key1: 'value1',
        key2: 'value2',
      },
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
}
