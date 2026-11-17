import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(({ isSsrBuild }) => {
  const rootDir = import.meta.dirname;

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'chanda-seo-preview-clean-urls',
        configurePreviewServer(server) {
          server.middlewares.use((req, res, next) => {
            const urlPath = (req.url || '/').split('?')[0];
            if (urlPath === '/robots.txt' || urlPath === '/sitemap.xml' || path.extname(urlPath)) {
              return next();
            }
            const distDir = path.resolve(rootDir, 'dist');
            const cleanRoute = urlPath.replace(/\/+$/, '') || '/';
            const candidate =
              cleanRoute === '/'
                ? path.join(distDir, 'index.html')
                : path.join(distDir, `${cleanRoute.slice(1)}.html`);

            if (fs.existsSync(candidate)) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end(fs.readFileSync(candidate, 'utf-8'));
              return;
            }
            const notFoundFile = path.join(distDir, '404.html');
            if (fs.existsSync(notFoundFile)) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end(fs.readFileSync(notFoundFile, 'utf-8'));
              return;
            }
            return next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, '.'),
      },
    },
    build: isSsrBuild
      ? {}
      : {
          rollupOptions: {
            output: {
              manualChunks(id: string) {
                if (id.includes('node_modules/three')) return 'three-vendor';
                if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
                  return 'react-vendor';
                }
                return undefined;
              },
            },
          },
        },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
