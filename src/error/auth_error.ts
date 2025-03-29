export interface FieldError {
    field: string;
    error: string;
    value: any;
}

export class AuthError extends Error {
  errorObject: {
        fieldErrors?: FieldError[],
        error?: string;
    };

  constructor(message: string, fieldErrors: FieldError[]) {
    super(message);
    this.name = 'AuthError';
    this.errorObject = {
      fieldErrors: fieldErrors,
      error: message,
    };
  }
}

export class NotFoundError extends AuthError {}
export class UnauthorizedError extends AuthError {}
export class BadRequestError extends AuthError {}
export class UnprocessableError extends AuthError {}
export class ForbiddenError extends AuthError {}
