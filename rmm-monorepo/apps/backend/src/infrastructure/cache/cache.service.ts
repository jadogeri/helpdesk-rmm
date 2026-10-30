// cache.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async set(key: string, value: any, ttlInSeconds: number = 3600): Promise<void> {
    try {
      // 💡 NestJS v11 (Keyv) natively expects milliseconds for expiration values
      await this.cacheManager.set(key, value, ttlInSeconds * 1000); 
    } catch (error) {
      this.logger.error(`❌ Failed to write key [${key}] to Redis store:`, error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now(); // ⏱️ Start execution tracking timer
    try {
      const result = await this.cacheManager.get<T>(key);
      const duration = (performance.now() - startTime).toFixed(2);

      // 💡 NestJS v11 Keyv explicitly returns 'undefined' on misses instead of 'null'
      if (result !== undefined && result !== null) {
        this.logger.log(`⚡ [CACHE HIT] Key: [${key}] | Duration: ${duration}ms`);
        return result;
      }

      this.logger.warn(`❄️ [CACHE MISS] Key: [${key}] | Duration: ${duration}ms`);
      return null;
    } catch (error) {
      const duration = (performance.now() - startTime).toFixed(2);
      this.logger.error(`⚠️ [CACHE ERROR] Key: [${key}] | Duration: ${duration}ms. Falling back to DB.`, error);
      return null;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      // Keyv wraps namespace stores inside an internal property map. 
      // Direct access can vary, but we look up native keys if exposed by the driver store hooks.
      const store = (this.cacheManager as any).store;
      if (store && typeof store.keys === 'function') {
        return await store.keys();
      }
      return [];
    } catch (error) {
      this.logger.error('❌ Failed to retrieve keys list from Redis:', error);
      return [];
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(`❌ Failed to delete key [${key}] from Redis:`, error);
    }
  }

  async reset(): Promise<void> {
    try {
      // 💡 NestJS v11 / Keyv drops .clear() in favor of unified .clear() implementation logic
      await this.cacheManager.clear();
      this.logger.log('🧹 Redis cache store completely purged.');
    } catch (error) {
      this.logger.error('❌ Failed to clear Redis cache store:', error);
    }
  }
}
