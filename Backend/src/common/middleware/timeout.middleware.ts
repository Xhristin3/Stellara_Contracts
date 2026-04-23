import { Injectable, NestMiddleware, RequestTimeoutException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TimeoutMiddleware implements NestMiddleware {
  private readonly timeoutMs: number;

  constructor() {
    // Default 30 second timeout for API requests
    this.timeoutMs = parseInt(process.env.HTTP_REQUEST_TIMEOUT_MS || '30000', 10);
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        throw new RequestTimeoutException(`Request timeout after ${this.timeoutMs}ms`);
      }
    }, this.timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    res.on('close', () => {
      clearTimeout(timeout);
    });

    next();
  }
}