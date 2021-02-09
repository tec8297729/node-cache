import LRU from 'lru-cache';

interface NodeCacheOpts {
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
export const initNodeCache = (options?: NodeCacheOpts) => {
  const defaultOpts = {
    max: 500, // 缓存最大值
    maxAge: 1000 * 60 * 5, // 1小时（60），5分钟
  };
  ssrCache = new LRU({
    ...defaultOpts,
    ...options,
  });
  console.log('初始化执行次数');
};

// node缓存数据
export const nodeCacheData = async <T,>({
  key,
  cb, // 接口回调
  code = 0, // 缓存标识码
  debug, // 是否开启调试模式，会打印查看是否记录了缓存
  isCustom = false, // 是否自定义缓存
}: ICacheData): Promise<T> => {
  if (!ssrCache) initNodeCache();
  if (ssrCache.has(key)) {
    // 有缓存情况
    const cacheRes = ssrCache.get(key);
    if (!debug) console.warn(`CACHE HIT: ${key}`);
    return cacheRes;
  }
  const cbRes = await cb?.();
  if (!debug) console.warn(`CACHE MISS: ${key}`);
  // 缓存
  if ((!isCustom && cbRes?.code === code) || isCustom) {
    ssrCache.set(key, cbRes);
  }
  return cbRes;
};
