/// <reference types="node" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // 将所有API请求代理到后端服务器
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                configure: function (proxy) {
                    proxy.on('error', function (err) {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', function (_, req) {
                        console.log('Sending Request:', req.method, req.url);
                    });
                    proxy.on('proxyRes', function (proxyRes, req) {
                        console.log('Received Response:', proxyRes.statusCode, req.url);
                    });
                }
            }
        }
    }
});
