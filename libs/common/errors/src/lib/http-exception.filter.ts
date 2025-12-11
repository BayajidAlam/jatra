import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";

export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
  details?: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: this.getErrorMessage(exception),
    };

    // Add error name for known exceptions
    if (exception instanceof HttpException) {
      errorResponse.error = exception.name;
      const exceptionResponse = exception.getResponse();
      if (
        typeof exceptionResponse === "object" &&
        "message" in exceptionResponse
      ) {
        const msg = exceptionResponse["message"];
        if (typeof msg === "string" || Array.isArray(msg)) {
          errorResponse.message = msg as string | string[];
        }
      }
    } else if (exception instanceof Error) {
      errorResponse.error = exception.name;
    }

    // Log the error
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${this.getErrorMessage(
          exception
        )}`,
        exception instanceof Error ? exception.stack : undefined
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${this.getErrorMessage(
          exception
        )}`
      );
    }

    response.status(status).json(errorResponse);
  }

  private getErrorMessage(exception: unknown): string | string[] {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === "string") {
        return response;
      }
      if (typeof response === "object" && "message" in response) {
        return response["message"] as string | string[];
      }
    }
    if (exception instanceof Error) {
      return exception.message;
    }
    return "Internal server error";
  }
}
