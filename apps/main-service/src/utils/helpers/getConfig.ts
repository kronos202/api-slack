import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/config/app/app-config.type';
import { AuthConfig } from 'src/config/auth/auth-config.types';
import { TemplateConfig } from 'src/config/template/template.type';

export const getAppConfig = (configService: ConfigService<AppConfig>) => {
  return {
    app: {
      app_port: configService.getOrThrow('app_port', { infer: true }),
      api_prefix: configService.getOrThrow('api_prefix', { infer: true }),
      app_name: configService.getOrThrow('app_name', { infer: true }),
      database_name: configService.getOrThrow('database_name', {
        infer: true,
      }),
      database_host: configService.getOrThrow('database_host', {
        infer: true,
      }),
      database_password: configService.getOrThrow('database_password', {
        infer: true,
      }),
      database_port: configService.getOrThrow('database_port', {
        infer: true,
      }),
      database_username: configService.getOrThrow('database_username', {
        infer: true,
      }),
      frontend_url: configService.getOrThrow('frontend_url', { infer: true }),
      node_env: configService.getOrThrow('node_env', { infer: true }),
    },
  };
};

export const getAuthConfig = (
  configService: ConfigService<AuthConfig>,
): AuthConfig => {
  return {
    confirm_email_expires: configService.getOrThrow('confirm_email_expires', {
      infer: true,
    }),
    confirm_email_secret: configService.getOrThrow('confirm_email_secret', {
      infer: true,
    }),
    access_expires_time: configService.getOrThrow('access_expires_time', {
      infer: true,
    }),
    refresh_expires_time: configService.getOrThrow('refresh_expires_time', {
      infer: true,
    }),
    access_secret_key: configService.getOrThrow('access_secret_key', {
      infer: true,
    }),
    refresh_secret_key: configService.getOrThrow('refresh_secret_key', {
      infer: true,
    }),
    forgot_password_expires: configService.getOrThrow(
      'forgot_password_expires',
      {
        infer: true,
      },
    ),
    forgot_password_secret: configService.getOrThrow('forgot_password_secret', {
      infer: true,
    }),
  };
};
export const getTemplateConfig = (
  configService: ConfigService<TemplateConfig>,
): TemplateConfig => {
  return {
    activation_email_template_id: configService.getOrThrow(
      'activation_email_template_id',
      {
        infer: true,
      },
    ),
    reset_password_template_id: configService.getOrThrow(
      'reset_password_template_id',
      {
        infer: true,
      },
    ),
    confirm_new_email_template_id: configService.getOrThrow(
      'confirm_new_email_template_id',
      {
        infer: true,
      },
    ),
  };
};
