import { Injectable, NestMiddleware, ConflictException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { IdempotencyService } from "../services/idempotency.service";

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  constructor(private readonly idempotency: IdempotencyService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Only apply to POST/PUT/PATCH requests
    if (!["POST", "PUT", "PATCH"].includes(req.method)) {
      return next();
    }

    // Check for Idempotency-Key header (client-provided)
    const clientKey = req.headers["idempotency-key"] as string;

    if (clientKey) {
      const key = `idempotency:client:${clientKey}`;

      // Check if this request was already processed
      const cached = await this.idempotency.checkIdempotency(key);
      if (cached) {
        // Return cached response
        return res.status(200).json(cached);
      }

      // Try to acquire lock
      const lockAcquired = await this.idempotency.acquireIdempotencyLock(key);
      if (!lockAcquired) {
        throw new ConflictException("Request is being processed, please wait");
      }

      // Store key in request for later use
      req["idempotencyKey"] = key;

      // Intercept response to cache result
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Cache successful responses
          this.idempotency.storeResult(key, body).catch(() => {});
        }
        this.idempotency.releaseIdempotencyLock(key).catch(() => {});
        return originalJson(body);
      };
    }

    next();
  }
}

// Interceptor version for controller-level idempotency
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
} from "@nestjs/common";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly idempotency: IdempotencyService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only apply to POST/PUT/PATCH requests
    if (!["POST", "PUT", "PATCH"].includes(method)) {
      return next.handle();
    }

    // Check for Idempotency-Key header
    const clientKey = request.headers["idempotency-key"] as string;

    if (clientKey) {
      const key = `idempotency:client:${clientKey}`;

      // Check if this request was already processed
      const cached = await this.idempotency.checkIdempotency(key);
      if (cached) {
        // Return cached response
        return of(cached);
      }

      // Try to acquire lock
      const lockAcquired = await this.idempotency.acquireIdempotencyLock(key);
      if (!lockAcquired) {
        throw new ConflictException("Request is being processed, please wait");
      }

      // Process request and cache result
      return next.handle().pipe(
        tap(async (data) => {
          try {
            await this.idempotency.storeResult(key, data);
          } finally {
            await this.idempotency.releaseIdempotencyLock(key);
          }
        })
      );
    }

    return next.handle();
  }
}
