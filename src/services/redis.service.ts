import Logger from '@config/Logger';
import { createClient, RedisClientType } from 'redis';

export class RedisService {
  private client: RedisClientType;
  private namespace = 'zodix'
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URI || 'redis://localhost:6379',

    });

    this.client.on('connect', () => Logger.info('Connected to Redis'));
    this.client.on('error', (err:any) => Logger.error('Redis error:', err));

    this.client.connect().catch((err:any) => {
      Logger.error('Error connecting to Redis:', err);
    });
  }

  public async set(key: string, value: unknown, expireInSeconds?: number) {
    try {
      const serializedValue = JSON.stringify(value);
      if (expireInSeconds) {
        await this.client.set(`${this.namespace}:${key}`, serializedValue, { EX: expireInSeconds });
      } else {
        await this.client.set(`${this.namespace}:${key}`, serializedValue);
      }
      Logger.info(`Redis key set: ${key}`);
    } catch (error) {
      Logger.error(`Error setting Redis key ${key}:`, error);
    }
  }

  public async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(`${this.namespace}:${key}`);
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      Logger.error(`Error getting Redis key ${key}:`, error);
      return null;
    }
  }

  public async update(key: string, value: unknown, expireInSeconds?: number) {
    try {
      const exists = await this.client.exists(`${this.namespace}:${key}`);
      if (!exists) {
        throw new Error(`Key ${key} does not exist in Redis.`);
      }
      await this.set(`${this.namespace}:${key}`, value, expireInSeconds);
      Logger.info(`Redis key updated: ${key}`);
    } catch (error) {
      Logger.error(`Error updating Redis key ${key}:`, error);
    }
  }

  public async delete(key: string) {
    try {
      await this.client.del(`${this.namespace}:${key}`);
      Logger.info(`Redis key deleted: ${key}`);
    } catch (error) {
      Logger.error(`Error deleting Redis key ${key}:`, error);
    }
  }
}
