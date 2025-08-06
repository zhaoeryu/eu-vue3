import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 8081
    },
    plugins: [
        vue(),
        // (svg图标插件)[https://github.com/vbenjs/vite-plugin-svg-icons/blob/main/README.zh_CN.md]
        createSvgIconsPlugin({
            // 指定需要缓存的图标文件夹
            iconDirs: [path.resolve(process.cwd(), 'src/assets/icons/svg')],
            // 指定symbolId格式
            symbolId: 'icon-[dir]-[name]'
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
});
