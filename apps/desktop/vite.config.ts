import { defineConfig } from 'vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), '../../packages/assets/icons')],
      symbolId: 'icon-[dir]-[name]',
      inject: 'body-last',
      customDomId: '__svg__icon__dom__',
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        additionalData: `@use "@project/assets/styles/variables.scss" as *;`,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@project/assets': path.resolve(__dirname, '../../packages/assets'),
    },
  },
  server: {
    port: 5178,
    proxy: {
      '/hub-backend-manage-service/': {
        //  用户服务
        target: 'http://inv.secxun.cn', //测试
        changeOrigin: true,
        ws: true,
      },
      '/hub-backend-incident-service/': {
        // 警情服务
        target: 'http://inv.secxun.cn', //测试
        changeOrigin: true,
        ws: true,
      },
      '/hub-backend-rpa-manage-service/': {
        // 警情服务
        target: 'http://inv.secxun.cn', //测试
        changeOrigin: true,
        ws: true,
      },
      '/hub-backend-fund-analysis-service/': {
        // 资金
        target: 'http://inv.secxun.cn', //测试
        changeOrigin: true,
        ws: true,
      },
      '/hub-backend-hongkong-service/': {
        // 香港
        target: 'http://inv.secxun.cn', //测试
        changeOrigin: true,
        ws: true,
      },
      '/sj-client-dz/': {
        target: 'http://inv.secxun.cn',
        changeOrigin: true,
        ws: true,
      },
      '/backend-manager-service/': {
        target: 'http://inv.secxun.cn',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
