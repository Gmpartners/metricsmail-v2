import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://metrics.devoltaaojogo.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Headers necessários para API
            proxyReq.setHeader('x-api-key', 'MAaDylN2bs0Y01Ep66');
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Accept', 'application/json');
            
            // 🔥 CORREÇÃO CACHE: Headers anti-cache no proxy - MÁXIMO
            proxyReq.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, private');
            proxyReq.setHeader('Pragma', 'no-cache');
            proxyReq.setHeader('Expires', '-1');
            proxyReq.setHeader('Last-Modified', new Date(0).toUTCString());
            proxyReq.setHeader('If-Modified-Since', new Date(0).toUTCString());
            proxyReq.setHeader('If-None-Match', '*');
            proxyReq.setHeader('X-No-Cache', 'true');
            proxyReq.setHeader('X-Fresh-Data', 'required');
            proxyReq.setHeader('X-Cache-Buster', Date.now().toString());
            proxyReq.setHeader('X-Proxy-Timestamp', Date.now().toString());
            
            console.log(`🔄 [${new Date().toLocaleTimeString()}] Proxy request: ${req.method} ${req.url} -> ${proxyReq.path}`);
          });
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // 🔥 CORREÇÃO CACHE: Headers anti-cache na response - FORÇA MÁXIMA
            proxyRes.headers['cache-control'] = 'no-cache, no-store, must-revalidate, max-age=0, private';
            proxyRes.headers['pragma'] = 'no-cache';
            proxyRes.headers['expires'] = '-1';
            proxyRes.headers['last-modified'] = new Date(0).toUTCString();
            proxyRes.headers['etag'] = undefined; // Remove etag
            proxyRes.headers['x-no-cache'] = 'true';
            proxyRes.headers['x-fresh-data'] = 'required';
            proxyRes.headers['x-proxy-fresh'] = Date.now().toString();
            
            // Remover headers que podem causar cache
            delete proxyRes.headers['etag'];
            delete proxyRes.headers['if-modified-since'];
            delete proxyRes.headers['if-none-match'];
            
            console.log(`✅ [${new Date().toLocaleTimeString()}] Proxy response: ${proxyRes.statusCode} for ${req.url} [NO-CACHE FORCED]`);
          });
          
          proxy.on('error', (err, req, res) => {
            console.error(`❌ [${new Date().toLocaleTimeString()}] Proxy error for ${req.url}:`, err.message);
          });
        }
      }
    }
  }
})