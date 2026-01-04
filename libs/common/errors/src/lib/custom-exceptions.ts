import { HttpException, HttpStatus } from "@nestjs/common";

export class ServiceUnavailableException extends HttpException {
  constructor(serviceName: string, details?: any) {
    super(
      {
        message: `${serviceName} is currently unavailable. Please try again later.`,
        error: "Service Unavailable",
        details,
      },
      HttpStatus.SERVICE_UNAVAILABLE
    );
  }
}

export class BusinessLogicException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST
  ) {
    super(
      {
        message,
        error: "Business Logic Error",
      },
      statusCode
    );
  }
}

export class ResourceLockedException extends HttpException {
  constructor(resourceType: string, resourceId: string) {
    super(
      {
        message: `${resourceType} with ID ${resourceId} is currently locked or in use`,
        error: "Resource Locked",
      },
      HttpStatus.CONFLICT
    );
  }
}

export class PaymentException extends HttpException {
  constructor(message: string, details?: any) {
    super(
      {
        message,
        error: "Payment Error",
        details,
      },
      HttpStatus.PAYMENT_REQUIRED
    );
  }
}
