import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { ManifestOptions, VitePWA } from 'vite-plugin-pwa';

const manifest: Partial<ManifestOptions> = {
  theme_color: '#b5c1b9',
  background_color: '#3e424e',
  display: 'fullscreen',
  orientation: 'landscape',
  start_url: '/chrono-sleuth/',
  id: 'com.amcolash.chrono',
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
  define: {
    __BUILD_TIME__: new Date(),
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
          maximumFileSizeToCacheInBytes: 10 * 1000 * 1000, // 10mb
          globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,webp,svg,gif}'],
        },
        manifest,

        devOptions: {
          // Enable to have service worker/manifest in dev mode
          // enabled: true,
        },
      }),
    ],
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
