import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

// Enum để định nghĩa các lỗi có thể loại bỏ
export enum ApiResponseType {
  BadRequest = 'BadRequest',
  Unauthorized = 'Unauthorized',
  Forbidden = 'Forbidden',
  NotFound = 'NotFound',
  UnprocessableEntity = 'UnprocessableEntity',
  TooManyRequests = 'TooManyRequests',
  InternalServerError = 'InternalServerError',
}

interface ApiOperationDecoratorOptions {
  type?: any;
  bodyType?: any;
  summary: string;
  description: string;
  path: string;
  exclude?: ApiResponseType[]; // Tham số exclude sử dụng enum ApiResponseType
}

export function ApiOperationDecorator({
  type,
  bodyType,
  summary,
  description,
  path,
  exclude = [], // Mặc định là mảng rỗng (không loại bỏ response nào)
}: ApiOperationDecoratorOptions) {
  const decorators = [
    ApiOperation({ summary }),
    ApiOkResponse({
      type,
      description,
    }),
    ApiBody({
      description: 'User credentials for login',
      type: bodyType, // DTO được sử dụng để Swagger hiển thị body parameters
    }),
    // Kiểm tra nếu không có "BadRequest" trong `exclude`, sẽ thêm ApiBadRequestResponse
    ...(exclude.includes(ApiResponseType.BadRequest)
      ? []
      : [
          ApiBadRequestResponse({
            description: 'Invalid data',
            example: {
              success: false,
              message: 'Invalid request payload',
              errors: 'Bad Request',
              path,
              code: 400,
            },
          }),
        ]),
    // Kiểm tra nếu không có "Unauthorized" trong `exclude`, sẽ thêm ApiUnauthorizedResponse
    ...(exclude.includes(ApiResponseType.Unauthorized)
      ? []
      : [
          ApiUnauthorizedResponse({
            description: 'Token is invalid',
            example: {
              success: false,
              message: 'Token is missing or invalid',
              errors: 'Unauthorized',
              path,
              code: 401,
            },
          }),
        ]),
    // Kiểm tra nếu không có "Forbidden" trong `exclude`, sẽ thêm ApiForbiddenResponse
    ...(exclude.includes(ApiResponseType.Forbidden)
      ? []
      : [
          ApiForbiddenResponse({
            description: 'Do not have permissions',
            example: {
              success: false,
              message: 'You do not have permission to access this resource',
              errors: 'Forbidden',
              path,
              code: 403,
            },
          }),
        ]),
    // Kiểm tra nếu không có "NotFound" trong `exclude`, sẽ thêm ApiNotFoundResponse
    ...(exclude.includes(ApiResponseType.NotFound)
      ? []
      : [
          ApiNotFoundResponse({
            description: 'Not found',
            example: {
              success: false,
              message: 'Requested resource not found',
              errors: 'Not Found',
              path,
              code: 404,
            },
          }),
        ]),
    // Kiểm tra nếu không có "UnprocessableEntity" trong `exclude`, sẽ thêm ApiUnprocessableEntityResponse
    ...(exclude.includes(ApiResponseType.UnprocessableEntity)
      ? []
      : [
          ApiUnprocessableEntityResponse({
            description: 'Invalid data',
            example: {
              success: false,
              message: 'The input data is invalid',
              errors: 'Unprocessable Entity',
              path,
              code: 422,
            },
          }),
        ]),
    // Kiểm tra nếu không có "TooManyRequests" trong `exclude`, sẽ thêm ApiTooManyRequestsResponse
    ...(exclude.includes(ApiResponseType.TooManyRequests)
      ? []
      : [
          ApiTooManyRequestsResponse({
            description: 'Too many request Error, please try later',
            example: {
              success: false,
              message:
                'Rate limit exceeded. Please wait for while before retrying',
              errors: 'Too many request Error',
              path,
              code: 429,
            },
          }),
        ]),
    // Kiểm tra nếu không có "InternalServerError" trong `exclude`, sẽ thêm ApiInternalServerErrorResponse
    ...(exclude.includes(ApiResponseType.InternalServerError)
      ? []
      : [
          ApiInternalServerErrorResponse({
            description: 'Internal server error, please try later',
            example: {
              success: false,
              message: 'Something went wrong on the server',
              errors: 'Internal Server Error',
              path,
              code: 500,
            },
          }),
        ]),
  ];

  return applyDecorators(...decorators);
}
