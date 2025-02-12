export class ApiError extends Error {
  statusCode: number;
  message: string;
  data?: any;
  success: boolean;
  errors: any[];
  stack?: string;

  constructor(
    statusCode: number,
    message: string = "Something Went Wrong...",
    errors: any[] = [],
    data?: any,
    stack?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;
    this.data = data;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      success: this.success,
      errors: this.errors,
      data: this.data,
      stack: this.stack,
    };
  }
}
