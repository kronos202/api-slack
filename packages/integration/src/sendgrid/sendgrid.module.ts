import { DynamicModule, Module, Global } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import { SendgridService } from './sendgrid.service';
export interface SendGridModuleOptions {
  apiKey: string;
  defaultSender?: string; // Email gửi mặc định.
}

@Global()
@Module({})
export class SendGridModule {
  static forRoot(options: SendGridModuleOptions): DynamicModule {
    if (!options.apiKey) {
      throw new Error('SendGrid API key is required');
    }

    // Initialize SendGrid API key
    sgMail.setApiKey(options.apiKey);

    return {
      module: SendGridModule,
      providers: [
        {
          provide: 'SENDGRID',
          useValue: sgMail,
        },
        {
          provide: 'SENDGRID_OPTIONS',
          useValue: options,
        },
        SendgridService,
      ],
      exports: ['SENDGRID', 'SENDGRID_OPTIONS', SendgridService],
    };
  }
}
