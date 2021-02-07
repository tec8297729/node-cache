# npm包基础层cli

方便快速开发插件的脚手架，sdk开发直接在src目录内开发，然后通过src/index.tsx文件导出方法或组件，打包sdk后即可发布npm平台

``` BASH
# 本地启动开发测试，省去link麻烦步骤
npm run dev

# 打包sdk，暴露window变量
npm run build:win

# 打包sdk常规方式，通过在react组件中使用的
npm run build:prod
```

## 本地测试注意事项

src/App.tsx和src/indexDev.tsx 是本地测试用的，里面写的代码并不会被打包于生产环境中去，可以尽情的去测试使用，并且不用删除代码块
