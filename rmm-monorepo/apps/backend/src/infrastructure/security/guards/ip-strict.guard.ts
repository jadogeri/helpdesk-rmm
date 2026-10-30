// ip-strict.guard.ts
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class IpStrictThrottlerGuard extends ThrottlerGuard {
  // Your installed package version demands a single 'req' argument here:
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const forwardedFor = req.headers['x-forwarded-for'];
    let realIp = '';

    if (typeof forwardedFor === 'string' && forwardedFor.trim() !== '') {
      realIp = forwardedFor.split(',')[0].trim();
    } else {
      realIp = req.ip || req.socket?.remoteAddress || 'unknown-ip';
    }

    console.log('Real IP:', realIp);
    return `ip:${realIp}`;
  }
}