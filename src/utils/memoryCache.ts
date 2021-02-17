import LRU from 'lru-cache';

interface MemoryCacheOpts {
  max?: number;
  maxAge?: number;
}

interface ICacheData {
  key: string;
  cb: () => Promise<any>;
  code?: number | null | undefined;
  debug?: boolean;
  isCustom?: boolean;
}

interface SsrCacheType {
  has: (key: string) => boolean;
  get: (key: string) => any;
  set: (key: string, data: any) => void;
}

let ssrCache: SsrCacheType;

// 初始化环境参数，默认5分钟
export const memoryCacheInit = (options?: MemoryCacheOpts) => {
  const defaultOpts = {
    max: 500, // 缓存最大值
    maxAge: 1000 * 60 * 5, // 1小时（60），5分钟
  };
  ssrCache = new LRU({
    ...defaultOpts,
    ...options,
  });
};

/**
 * node缓存数据方法
 * @key 缓存数据的key，唯一性
 * @cb 请求接口回调
 * @code 缓存标识码，默认为0，获取接口返回数据的code码
 * @debug 是否开启调试模式，会打印是否记录缓存
 * @isCustom 是否自定义缓存
 */
export const memoryCacheData = async <T>({
  key,
  cb,
  code = 0,
  debug,
  isCustom = false,
}: ICacheData): Promise<T> => {
  if (!ssrCache) memoryCacheInit();
  if (ssrCache.has(key)) {
    // 有缓存情况
    const cacheRes = ssrCache.get(key);
    if (debug) console.warn(`CACHE HIT: ${key}`);
    return cacheRes;
  }
  const cbRes = await cb?.();
  if (debug) console.warn(`CACHE MISS: ${key}`);
  // 缓存
  if ((!isCustom && cbRes?.code === code) || isCustom) {
    ssrCache.set(key, cbRes);
  }
  return cbRes;
};
