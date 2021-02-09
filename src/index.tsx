import LRU from 'lru-cache';

const options = {
  max: 500, // 缓存最大值
  maxAge: 1000 * 60 * 2, // 1小时（60），2分钟
};
const ssrCache = new LRU(options);

interface ICacheData {
  key: string;
  cb: () => Promise<any>;
  code: number | null | undefined;
  debug: boolean;
  isCustom: boolean;
}

const nodeCache = async <T,>({
  key,
  cb, // 接口回调
  code = 0, // 缓存标识码
  debug, // 是否开启调试模式，会打印查看是否记录了缓存
  isCustom = false, // 是否自定义缓存
}: ICacheData): Promise<T> => {
  // 有缓存情况
  if (ssrCache.has(key)) {
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

export { nodeCache };
