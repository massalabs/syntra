var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default (function (_a) {
  var mode = _a.mode;
  // loadEnv(mode, process.cwd()) will load the .env files depending on the mode
  // import.meta.env.VITE_BASE_APP available here with: process.env.VITE_BASE_APP
  process.env = __assign(
    __assign({}, process.env),
    loadEnv(mode, process.cwd()),
  );
  return defineConfig({
    plugins: [react()],
    server: {
      fs: {
        // to allow server ui kit asset like font files
        allow: ['../..'],
      },
    },
    optimizeDeps: {
      include: ['react-dom', 'dot-object'],
    },
    resolve: {
      alias: {
        '@': ''.concat(__dirname, '/src'),
      },
    },
  });
});
