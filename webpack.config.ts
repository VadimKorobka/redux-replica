import webpack from 'webpack'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'

/**
 * Failed to load tsconfig.json: Missing baseUrl in compilerOptions
 * https://github.com/dividab/tsconfig-paths-webpack-plugin/issues/32
 */
delete process.env.TS_NODE_PROJECT

const DEFAULT_STAGE = 'production'
const stage = process.env.BUILD_STAGE || DEFAULT_STAGE
console.log('stage', stage)

const webpackConfig: webpack.Configuration = {
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
          // 'cache-loader',
          {
            loader: 'awesome-typescript-loader',
            options: {
              compiler: 'ttypescript',
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
