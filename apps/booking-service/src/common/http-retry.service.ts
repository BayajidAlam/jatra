import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface RetryConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  timeoutMs?: number;
  backoffMultiplier?: number;
}

@Injectable()
export class HttpRetryService {
  private readonly logger = new Logger(HttpRetryService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Execute HTTP request with exponential backoff retry
   */
  async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    serviceName: string,
    config: RetryConfig = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      initialDelayMs = 1000,
      maxDelayMs = 10000,
      timeoutMs = 30000,
      backoffMultiplier = 2,
    } = config;

    let lastError: Error;
    let delay = initialDelayMs;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        this.logger.debug(
          `Attempt ${attempt}/${maxRetries + 1} for ${serviceName}`
        );

        const result = await Promise.race([
          requestFn(),
          this.createTimeoutPromise(timeoutMs),
        ]);

        if (attempt > 1) {
          this.logger.log(
            `✅ ${serviceName} succeeded after ${attempt} attempts`
          );
        }

        return result as T;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt > maxRetries) {
          this.logger.error(
            `❌ ${serviceName} failed after ${maxRetries} retries: ${lastError.message}`
          );
          throw lastError;
        }

        // Don't retry on client errors (4xx)
        if (this.isClientError(error)) {
          this.logger.error(
            `❌ ${serviceName} client error (no retry): ${lastError.message}`
          );
          throw lastError;
        }

        this.logger.warn(
          `⚠️ ${serviceName} attempt ${attempt} failed, retrying in ${delay}ms: ${lastError.message}`
        );

        await this.sleep(delay);
        delay = Math.min(delay * backoffMultiplier, maxDelayMs);
      }
    }

    throw lastError!;
  }

  /**
   * POST request with retry
   */
  async post<T>(
    url: string,
    data: any,
    serviceName: string,
    config?: RetryConfig
  ): Promise<T> {
    return this.executeWithRetry(
      async () => {
        const response = await firstValueFrom(
          this.httpService.post(url, data)
        );
        return response.data as T;
      },
      serviceName,
      config
    );
  }

  /**
   * GET request with retry
   */
  async get<T>(
    url: string,
    serviceName: string,
    config?: RetryConfig
  ): Promise<T> {
    return this.executeWithRetry(
      async () => {
        const response = await firstValueFrom(this.httpService.get(url));
        return response.data as T;
      },
      serviceName,
      config
    );
  }

  private isClientError(error: any): boolean {
    if (error?.response?.status) {
      const status = error.response.status;
      return status >= 400 && status < 500;
    }
    return false;
  }

  private createTimeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`Request timeout after ${ms}ms`)),
        ms
      )
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
