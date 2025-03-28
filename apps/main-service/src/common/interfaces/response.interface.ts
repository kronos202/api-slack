export interface IResponse {
  success: boolean;
  path?: string;
  message?: string;
  errors?: string;
  data?: unknown;
  code?: number | string;
}
