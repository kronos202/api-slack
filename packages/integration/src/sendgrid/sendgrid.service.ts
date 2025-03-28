import { Inject, Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class SendgridService {
  constructor(
    @Inject('SENDGRID') private readonly sendGridClient: typeof sgMail,
    @Inject('SENDGRID_OPTIONS') private readonly options: { defaultSender: string },
  ) {}

  async sendDynamicEmail(
    to: string,
    templateId: string,
    dynamicData: Record<string, any>,
  ): Promise<void> {
    try {
      const msg = {
        to,
        from: this.options.defaultSender,
        templateId,
        dynamicTemplateData: dynamicData,
      };
      await this.sendGridClient.send(msg);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}
