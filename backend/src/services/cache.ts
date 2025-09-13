import crypto from 'crypto';

class MockCacheService {
  private cache: Map<string, { value: any; expiresAt: number }> = new Map();

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expiresAt });
    console.log(`💾 Cached: ${key}`);
  }

  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      console.log(`❌ Cache miss: ${key}`);
      return null;
    }
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      console.log(`⏰ Cache expired: ${key}`);
      return null;
    }
    
    console.log(`✅ Cache hit: ${key}`);
    return entry.value;
  }

  generatePromptKey(prompt: string): string {
    const hash = crypto.createHash('md5').update(prompt.trim().toLowerCase()).digest('hex');
    return `prompt:${hash}`;
  }

  getStats() {
    return { totalKeys: this.cache.size };
  }
}

export const cache = new MockCacheService();

/* 
// Real Redis implementation:
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
});

export const cache = {
  async set(key: string, value: any, ttlSeconds: number = 3600) {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  },
  
  async get(key: string) {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },
  
  generatePromptKey(prompt: string) {
    const hash = crypto.createHash('md5').update(prompt.trim().toLowerCase()).digest('hex');
    return `prompt:${hash}`;
  }
};
*/