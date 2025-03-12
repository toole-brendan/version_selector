import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  
  return {
    plugins: [
      react(),
      runtimeErrorOverlay(),
      themePlugin(),
      // Remove the complex dynamic import for now, as it's not critical for fixing MIME types
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
      },
    },
    // No base prefix in production to match the working deploy-pitch.sh approach
    base: '/',
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          // Ensure proper module entries with correct content types
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        }
      }
    },
    server: {
      // Let Vite find an available port automatically
      port: 3000,
      strictPort: false,
      host: "localhost",
      // Add proxy for API requests
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          rewrite: (path) => path,
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (_proxyReq, req, _res, _options) => {
              console.log(`Proxying ${req.method} ${req.url}`);
            });
            proxy.on('error', (err) => {
              console.log('Proxy error:', err);
            });
          },
        },
      },
    },
  };
});
