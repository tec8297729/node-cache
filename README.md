# node-cache

一款node高速缓存sdk解决方案，让你的node具有质的改变！

简单包裹后端接口方法，即可享受高速缓存效果，或是使用redis高级API功能，让你的集群更高效的缓存数据！！

内置高效的promiseAll方法，混合缓存API使用方式见文档说明！

## 普通缓存使用方法

以nextjs框架使用案例
1、在node层server.js文件内，调用memoryCacheInit初始方法。

``` ts
// server.js
const Koa = require('koa');
const next = require('next');
const { memoryCacheInit } = require('@kkb/node-cache');
const app = next({dev});
const server = new Koa();

app.prepare().then(() => {
  // ...其它配置
  // nodeCache初始化缓存，以下为默认参数
  memoryCacheInit({
    max: 500, // 缓存最大值
    maxAge: 1000 * 60 * 5, // 默认5分钟
  });
  server.listen(6000, () => {
    console.log(`> Ready on http://localhost:${port}`);
  }); 
}
```

<br>

2、需要缓存接口，调用memoryCacheData方法进行包裹，即可缓存数据。

``` jsx
import React from 'react';
import { memoryCacheData } from '@kkb/node-cache';
import { getHomeData } from '../../services/commonService';

const Home = () => {}
export const getServerSideProps = async content => {
  const res = await memoryCacheData({
    key: 'dataKey', // 缓存key，需要唯一性
    cb: () => getHomeData(), // cb缓存回调，getHomeData是后端接口
    debug: true, // 是否开启调试模式（可选），会打印是否记录缓存
    code: 0, // 缓存标识码（可选），默认为0，此code是接口返回的数据中带有code字段
  });
  return {
    props: {}
  };
};
export default Home;
```

<br><br>

## redis缓存使用方法

1、node层初始化

``` ts
// server.js
const Koa = require('koa');
const { redisCacheInit } = require('@kkb/node-cache');
const next = require('next');

const app = next({dev});
const server = new Koa();

app.prepare().then(() => {
  // ...其它配置
  redisCacheInit({
    host: '182.0.0.1',
    port: 6579, // 端口号
    password: 'xxxxx', // 密码
    db: 0, // 连接第几个db数据库
    expire: 60, // 全局缓存过期时间，单位秒
    errorCb: err => {}, // 连接redis失败回调
    readyCb: client => {}, // 连接redis成功后回调
  });

  server.listen(6000, () => {
    console.log(`> Ready on http://localhost:${port}`);
  }); 
}

```

2、在需要缓存接口，调用redisCacheData方法进行包裹，即可缓存数据。

``` jsx
import React from 'react';
import { memoryCacheData } from '@kkb/node-cache';
import { getHomeData } from '../../services/commonService';

const Home = () => {}
export const getServerSideProps = async content => {
  const res = await memoryCacheData({
    key: 'dataKey', // 缓存key，需要唯一性
    cb: () => getHomeData(), // cb缓存回调，getHomeData是后端接口
    debug: false, // 是否开启调试模式（可选），会打印是否记录缓存
    code: 0, // 缓存标识码（可选），默认为0，此code是接口返回的数据中带有code字段
    expire: 10 // 缓存过期时间(可选)
  });
  return {
    props: {}
  };
};
export default Home;

```

## 高级promiseAll混合使用

sdk中内置promiseAll方法，供在node中同时请求返回数据，结合缓存API达到多线程缓存

初始化缓存API相关见上面文档使用即可，关键在于页面层node调用，以nextjs页面为例：

``` jsx
import React from 'react';
import { memoryCacheData } from '@kkb/node-cache';
import { getHomeData } from '../../services/commonService';

const Home = () => {}
export const getServerSideProps = async content => {
  // 同时请求所有接口，返回一个数组（所有接口数据），按顺序返回
  const resArrs = await promiseAll([
    memoryCacheData({
      key: 'dataKey1', 
      cb: () => getHomeData(1, 1),
    }),
    memoryCacheData({
      key: 'dataKey2', 
      cb: () => getHomeData(3, 1),
    })
  ]);
  console.log('dataKey1', resArrs[0]);
  console.log('dataKey2', resArrs[1]);
  return {
    props: {}
  };
};
export default Home;
```
