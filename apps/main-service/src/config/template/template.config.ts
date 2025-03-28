import { registerAs } from '@nestjs/config';
import validateConfig from '../../utils/validate-config';
import { IsOptional, IsString } from 'class-validator';
import { TemplateConfig } from './template.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  ACTIVATION_EMAIL_TEMPLATE_ID: string;

  @IsString()
  @IsOptional()
  RESET_PASSWORD_TEMPLATE_ID: string;

  @IsString()
  @IsOptional()
  CONFIRM_NEW_EMAIL_TEMPLATE_ID: string;
}

export default registerAs<TemplateConfig>('template', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    activation_email_template_id:
      process.env.ACTIVATION_EMAIL_TEMPLATE_ID || '',
    reset_password_template_id: process.env.RESET_PASSWORD_TEMPLATE_ID || '',
    confirm_new_email_template_id:
      process.env.CONFIRM_NEW_EMAIL_TEMPLATE_ID || '',
  };
});
