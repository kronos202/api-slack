import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import PRISMA_ERROR_MAPPING from '../mapping/prisma-error.mapping';
import { IResponse } from '../interfaces/response.interface';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const { code } = exception;
    if (!code) {
      response.status(202).json();
    }
    const error = PRISMA_ERROR_MAPPING[code];

    const responseBody: IResponse = {
      success: false,
      message: error.message,
      path: request.url,
      code: code,
    };

    response.status(error.status).json(responseBody);
  }
}
