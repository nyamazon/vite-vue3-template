import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),

    tailwindcss(),
  ],
  build: {
    minify: 'terser', // 默认为esbuild
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除console
        drop_debugger: true, // 生产环境移除debugger
      },
    },
  },
  rollupOptions: {
    output: {
      manualChunks(id) {
        // node_modules 下文件分包
        if (id.includes('node_modules')) {
          return id.toString().split('node_modules/')[1].split('/')[0].toString();
        }
      },
      chunkFileNames: 'vendors/[name]-[hash].js', // 三方库文件
      entryFileNames: 'js/[name]-[hash].js', // entry js文件
      assetFileNames: '[ext]/[name]-[hash].[ext]', // css文件
    },
  },
});
