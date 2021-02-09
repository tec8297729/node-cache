const { merge } = require('webpack-merge');
const paths = require('./paths');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const isProd = ['prod', 'win'].includes(process.env.BUILD_ENV);
const configName = `./webpack.${isProd ? 'prod' : 'dev'}.js`;
const merge_Webpack_Config = require(`./${configName}`); // 加载webpack配置
const WebpackBar = require('webpackbar');
const appPackageJson = require(paths.appPackageJson);
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

const config = {
  ...process.env,
};

const webpackConfig = {
  entry: {
    index: isProd ? paths.appIndexJs : paths.appIndexDevJs,
  },
  resolve: {
    alias: {
      '@': paths.appSrc,
    },
    // 指定一些node包集成
    fallback: {
      util: require.resolve('util/'), // 第三方包
      assert: require.resolve('assert/'),
      fs: false,
      tls: false,
      net: false,
      path: false,
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  bail: false,
  target: 'node',
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx|jsx)$/,
        use: [
          // {
          //   loader: 'babel-loader',
          //   options: {
          //     cacheDirectory: true,
          //   },
          // },
          'ts-loader',
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new WebpackBar({
      name: appPackageJson.name,
      color: '#00AFF2',
      profile: true,
      minimal: false,
      compiledIn: false,
    }),
    new FriendlyErrorsWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].chunk.css',
    }),
  ],
  // cache: {
  //   type: 'filesystem',
  //   version: 'v0.0.1',
  // },
  node: {
    global: false,
    __filename: false,
    __dirname: false,
  },
  performance: false,
};

module.exports = merge(webpackConfig, merge_Webpack_Config(config));
