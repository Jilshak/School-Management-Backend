import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsAppService {
  constructor(private configService: ConfigService) {}

  async sendMessage(phoneNumber: string, username: string, password: string) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("authkey", this.configService.get<string>('MSG91_AUTH_KEY'));

    const raw = JSON.stringify({
      "integrated_number": this.configService.get<string>('MSG91_INTEGRATED_NUMBER'),
      "content_type": "template",
      "payload": {
        "messaging_product": "whatsapp",
        "type": "template",
        "template": {
          "name": "username_and_password",
          "language": {
            "code": "en",
            "policy": "deterministic"
          },
          "namespace": null,
          "to_and_components": [
            {
              "to": [
                phoneNumber
              ],
              "components": {
                "body_1": {
                  "type": "text",
                  "value": username
                },
                "body_2": {
                  "type": "text",
                  "value": password
                }
              }
            }
          ]
        }
      }
    });

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    try {
      const response = await fetch(this.configService.get<string>('WHATSAPP_API_URL'), requestOptions);
      const result = await response.text();
      return { success: true, result };
    } catch (error) {
      console.error('error', error);
      return { success: false, error: error.message };
    }
  }
}