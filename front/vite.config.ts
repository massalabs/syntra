import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default ({ mode }) => {
  // loadEnv(mode, process.cwd()) will load the .env files depending on the mode
  // import.meta.env.VITE_BASE_APP available here with: process.env.VITE_BASE_APP
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    plugins: [nodePolyfills(), react(), ViteImageOptimizer(), visualizer()],
    server: {
      fs: {
        // to allow server ui kit asset like font files
        allow: ['../..'],
      },
    },
    optimizeDeps: {
      include: ['react-dom', 'dot-object', 'copy-to-clipboard'],
    },

    resolve: {
      alias: {
        '@': `${__dirname}/src`,
      },
    },
  });
};
