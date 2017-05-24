declare module 'wix-errors' {
  interface ErrorClass extends Error {
    readonly cause: Error;
    readonly errorCode: number;
    readonly httpStatusCode: number;
  }

  type WixErrorClass = (errorCode: number, httpStatus: number) => (new (msg: string, cause: Error) => ErrorClass);
  type WixBusinessError = WixErrorClass;
  type WixSystemError = WixErrorClass;

  interface WixError extends WixErrorClass {}

  export type HttpStatus = any;
  type ErrorCode = {
    UNKNOWN: number,
    INVALID_SESSION: number,
    RPC_ERROR: number,
    GATEKEEPER_ACCESS_DENIED: number,
    HEALTH_TEST_FAILED: number,
    SESSION_REQUIRED: number,
    BAD_CSRF_TOKEN: number
  };

  const ErrorCode: ErrorCode;

  export const wixBusinessError: WixBusinessError;
  export const wixSystemError: WixSystemError;
  export const WixError: WixError;
}
