import 'dotenv/config'; // Side effect import to load env vars.
import { defineConfig } from '@rspack/cli';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rspackConfig = defineConfig({
  mode: IS_PRODUCTION ? 'production' : 'development',
  context: __dirname,
  cache: true,
  entry: {
    server: './src/server.ts',
  },
  output: {
    filename: '[name].cjs',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    library: {
      type: 'commonjs2',
    },
  },
  target: 'node',
  devtool: IS_PRODUCTION ? false : 'source-map',
  watchOptions: {
    aggregateTimeout: 30,
    ignored: [
      path.resolve(__dirname, '.swc'),
      path.resolve(__dirname, 'dist'),
      path.resolve(__dirname, 'node_modules'),
    ],
  },
  stats: {
    preset: 'normal',
    warnings: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.ts', '.json'],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: [/[\\/]node_modules[\\/]/],
        include: path.resolve(__dirname, 'src'),
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: { syntax: 'typescript' },
              target: 'es2024',
              experimental: {
                cacheRoot: process.env.SWC_CACHE_DIR || undefined,
              },
            },
          },
        },
      },
    ],
  },
});

export default rspackConfig;
