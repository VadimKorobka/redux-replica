/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack')

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const DEFAULT_STAGE = 'production'
const stage = process.env.BUILD_STAGE || DEFAULT_STAGE
console.log('stage', stage)

const webpackConfig = {
  mode: 'development',
  target: 'electron-main',
  entry: {
    index: './src/index.ts',
    'index.min': './src/index.ts',
  },
  output: {
    filename: '[name].js',
    path: `${__dirname}/lib`,
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.js', '.json'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: './tsconfig.json',
        extensions: ['.ts', '.js', '.json'],
        baseUrl: '.',
      }),
    ],
  },

  module: {
    rules: [
      {
        test: /\.(t|j)s$/,
        exclude: /node_modules/,
        use: [
          'cache-loader',
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              configFile: 'tsconfig.json',
            },
          },
        ],
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['cache-loader', 'source-map-loader'],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      IS_ELECTRON: process.env.TARGET_ENV === 'electron',
      IS_EXT: process.env.TARGET_ENV === 'extension',
    }),
    new LodashModuleReplacementPlugin(),
    new CleanWebpackPlugin(),
    // new BundleAnalyzerPlugin(),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.min\.js$/i,
      }),
    ],
  },
}

if (stage === 'local') {
  webpackConfig.watch = true
  webpackConfig.mode = 'development'
  webpackConfig.devtool = 'inline-source-map'
  webpackConfig.stats = 'errors-only'

  webpackConfig.plugins.push(
    new ForkTsCheckerWebpackPlugin({
      tsconfig: './tsconfig.json',
    }),
  )
}

module.exports = webpackConfig
