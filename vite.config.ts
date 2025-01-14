import { defineConfig } from 'vite';
import generateFile from 'vite-plugin-generate-file';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { ManifestOptions, VitePWA } from 'vite-plugin-pwa';

const buildTime = new Date();

const manifest: Partial<ManifestOptions> = {
  theme_color: '#eebbff',
  background_color: '#111111',
  display: 'fullscreen',
  orientation: 'landscape',
  start_url: '/chrono-sleuth/',
  id: 'com.amcolash.chrono-sleuth',
  name: 'Chrono Sleuth',
  short_name: 'Chrono Sleuth',
  description: 'Chrono Sleuth is a detective game set in a mysterious town.',

  icons: [
    {
      src: './favicon.webp',
      sizes: 'any',
      type: 'image/webp',
      purpose: 'any maskable',
    },
  ],
};

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },

    // TODO: Is this the right choice?
    // This removes comments (licenses)
    minify: 'terser',
    terserOptions: {
      compress: {
        passes: 2,
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
  },
  server: {
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  define: {
    __BUILD_TIME__: buildTime,
    __TAURI__: process.env.TAURI_PLATFORM !== undefined,
  },
  plugins: [
    // Only include PWA plugin if not building for Tauri
    process.env.TAURI_PLATFORM === undefined && [
      // Inject SW registration in main.ts - only when building for web
      {
        name: 'injectServiceWorker',
        transform(code, id) {
          if (id.endsWith('src/main.ts')) {
            return `import { registerSW } from "virtual:pwa-register";
            registerSW({ immediate: true });

            ${code}`;
          }
          return code;
        },
      },
      VitePWA({
        // TODO: Is this the right choice?
        registerType: 'autoUpdate',

        workbox: {
          maximumFileSizeToCacheInBytes: 30 * 1000 * 1000, // 30mb
          globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,webp,svg,gif,ttf,m4a,mp3}'],
        },
        manifest,

        devOptions: {
          // Enable to have service worker/manifest in dev mode
          // enabled: true,
        },
      }),
    ],
    generateFile([
      {
        type: 'json',
        output: './build.json',
        data: { buildTime },
      },
    ]),
    ViteImageOptimizer({
      png: {
        quality: 50,
      },
      jpg: {
        quality: 40,
      },
      jpeg: {
        quality: 40,
      },
      cache: true,
      cacheLocation: 'node_modules/.cache/vite-plugin-image-optimizer',
    }),
  ],
});
