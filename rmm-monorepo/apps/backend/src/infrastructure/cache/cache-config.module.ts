// src/common/cache/cache-config.module.ts
import { Module, Global, Logger } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      // 💡 Remove ConfigModule injections to prevent silent async resolution races
      useFactory: async () => {
        const logger = new Logger('CacheConfigModule');
        
        // 🛡️ CRITICAL FIX: Pull values synchronously from process.env immediately
        let host = process.env.REDIS_HOST || '127.0.0.1';
        
        if (host === 'localhost') {
          host = '127.0.0.1';
        } else if (process.env.NODE_ENV === 'production' && !process.env.REDIS_HOST) {
          host = 'redis_cache';
        }

        const port = Number(process.env.REDIS_PORT) || 6379;
        const password = process.env.REDIS_PASSWORD || '';
        
        // 🔒 Escape complex credential strings safely within standard parameters
        const encodedPassword = encodeURIComponent(password);
        const redisUrl = `redis://:${encodedPassword}@${host}:${port}`;

        logger.log(`🔄 NestJS v11 establishing explicit loopback network link to Redis at ${host}:${port}`);

        return {
          stores: [
            createKeyv(redisUrl),
          ],
          ttl: 3600 * 1000, // 1 hour default fallback mapping window in milliseconds
        };
      },
      isGlobal: true, 
    }),
  ],
  providers: [CacheService],
  exports: [CacheService], 
})
export class CacheConfigModule {}
