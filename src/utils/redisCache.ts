import redis from 'redis';

interface ICacheData {
  key: string;
  cb: () => Promise<any>;
  code?: number | null | undefined;
  debug?: boolean;
  isCustom?: boolean;
  expire: number;
}

interface RedisCacheOpts extends redis.ClientOpts {
  expire?: number;
  errorCb?: (e: any) => void; // 错误时回调
  readyCb?: (client: redis.RedisClient) => void; // 连接成功回调
}

let redisClient: redis.RedisClient;
let globalExpire: number = 60; // 全局缓存过期时间，单位秒

/**
 * 初始化redis连接
 * @options 文档https://www.npmjs.com/package/redis
 */
export const redisCacheInit = (options?: RedisCacheOpts) => {
  const { expire, errorCb, readyCb, ...redisOpts } = options || {};
  globalExpire = expire || globalExpire;

  redisClient = redis.createClient({
    ...redisOpts,
  });
  redisClient.on('ready', () => {
    readyCb?.(redisClient);
  });

  redisClient.on('error', (error) => {
    errorCb?.(error);
  });
};

/**
 * node缓存数据方法（redis版本）
 * @key 缓存数据的key，唯一性
 * @expire 缓存过期时间
 * @cb 请求接口回调
 * @code 缓存标识码，默认为0，获取接口返回数据的code码
 * @debug 是否开启调试模式，会打印是否记录缓存
 * @isCustom 是否自定义缓存
 */
export const redisCacheData = <T>({
  key,
  expire,
  cb,
  code = 0,
  debug,
  isCustom = false,
}: ICacheData): Promise<T> => {
  if (!redisClient) redisCacheInit();
  return new Promise((resolve, reject) => {
    try {
      redisClient.get(key, (_err, reply) => {
        // 有缓存情况
        if (reply) {
          if (debug) console.warn(`CACHE HIT: ${key}`);
          resolve(JSON.parse(reply));
          return;
        }
        cb?.().then((cbRes) => {
          if (debug) console.warn(`CACHE MISS: ${key}`);
          // 缓存
          if ((!isCustom && cbRes?.code === code) || isCustom) {
            redisClient.set(key, JSON.stringify(cbRes));
            // 指定key缓存过期时间，超过后自动清除redis数据
            redisClient.expire(key, expire ?? globalExpire);
          }
          resolve(cbRes);
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};
