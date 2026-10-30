import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import * as crypto from 'crypto';

@Injectable()
export class DeviceFlexibleThrottlerGuard extends ThrottlerGuard {
  // Your installed package version demands a single 'req' argument here:
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const forwardedFor = req.headers['x-forwarded-for'];
    let realIp = '';

    if (typeof forwardedFor === 'string' && forwardedFor.trim() !== '') {
      realIp = forwardedFor.split(',')[0].trim();
    } else {
      realIp = req.ip || req.socket?.remoteAddress || 'unknown-ip';
    }

    const userAgent = req.headers['user-agent'] || 'unknown-device';
    const acceptLanguage = req.headers['accept-language'] || '';
    const deviceFingerprint = req.headers['x-device-fingerprint'] || '';

    // Safer concatenation using structured dividers to eliminate string collisions
    const rawTrackerKey = [
      'dev',
      realIp,
      userAgent,
      acceptLanguage,
      deviceFingerprint
    ].join('::');

    console.log('Raw Tracker Key:', rawTrackerKey);

    return crypto.createHash('sha256').update(rawTrackerKey).digest('hex');
  }
}
