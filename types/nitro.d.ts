import type { RedisClientType } from 'redis';
import type { RedisModules, RedisFunctions, RedisScripts } from 'redis';

declare module 'nitropack' {
    interface NitroApp {
        redis: RedisClientType<RedisDefaultModules & RedisModules, RedisFunctions, RedisScripts, 2 | 3, TypeMapping>;
    }
}
