import { defineConfig, loadEnv, PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills, PolyfillOptions } from 'vite-plugin-node-polyfills';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { visualizer } from 'rollup-plugin-visualizer';
import webpackStatsPlugin from 'rollup-plugin-webpack-stats';

// https://vitejs.dev/config/
export default ({ mode }) => {
  // loadEnv(mode, process.cwd()) will load the .env files depending on the mode
  // import.meta.env.VITE_BASE_APP available here with: process.env.VITE_BASE_APP
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  // see https://github.com/davidmyersdev/vite-plugin-node-polyfills/issues/81#issuecomment-2325104572
  const nodePolyfillsFix = (
    options?: PolyfillOptions | undefined,
  ): PluginOption => {
    return {
      ...nodePolyfills(options),
      resolveId(source: string) {
        const m =
          /^vite-plugin-node-polyfills\/shims\/(buffer|global|process)$/.exec(
            source,
          );
        if (m) {
          return `node_modules/vite-plugin-node-polyfills/shims/${m[1]}/dist/index.cjs`;
        }
      },
    };
  };

  return defineConfig({
    // eslint-disable-next-line new-cap
    plugins: [nodePolyfillsFix(), react(), ViteImageOptimizer(), visualizer(),webpackStatsPlugin()],
    server: {
      fs: {
        // to allow server ui kit asset like font files
        allow: ['../..'],
      },
    },
    optimizeDeps: {
      include: ['react-dom', 'dot-object', 'copy-to-clipboard'],
    },
    build: {
      minify: 'terser',
      rollupOptions: {
        output: {
          // Use a supported file pattern for Vite 5/Rollup 4
          // @doc https://relative-ci.com/documentation/guides/vite-config
          assetFileNames: 'assets/[name].[hash][extname]',
          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js',
        },
      },
    },
    resolve: {
      alias: {
        '@': `${__dirname}/src`,
      },
    },
  });
};
