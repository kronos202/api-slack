import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { SendgridService } from '@packages/integration';

@Processor('email-queue')
@Injectable()
export class UserProcessor {
  constructor(private readonly sendgridService: SendgridService) {}

  @Process('registration-job')
  async handleRegistrationJob(
    job: Job<{
      email: string;
      activation_email_template_id: string;
      username: string;
      verification_link: string;
    }>,
  ) {
    const email = job.data.email;
    const activation_email_template_id: string =
      job.data.activation_email_template_id;
    const username = job.data.username;
    const verification_link = job.data.verification_link;

    console.log('job.data: ', job.data);

    await this.sendgridService.sendDynamicEmail(
      email,
      activation_email_template_id,
      { username, verification_link },
    );
  }

  // Phương thức xử lý job reset mật khẩu
  @Process('password-reset-job') // Tên job là 'password-reset-job'
  async handlePasswordResetJob(
    job: Job<{
      email: string;
      reset_password_template_id: string;
      username: string;
      forgot_link: string;
      expires_in: string;
    }>,
  ) {
    console.log('Processing password reset job...');
    await this.sendgridService.sendDynamicEmail(
      job.data.email,
      job.data.reset_password_template_id,
      {
        username: job.data.username,
        forgot_link: job.data.forgot_link,
        expires_in: job.data.expires_in,
      },
    );
  }
}
