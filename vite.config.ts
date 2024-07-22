import { defineConfig } from 'vite';
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
  },
  plugins: [
    VitePWA({
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1000 * 1000, // 10mb
      },
      // cache static assets in the public folder
      includeAssets: ['**/*'],
      manifest,

      devOptions: {
        // Enable to have service worker/manifest in dev mode
        // enabled: true,
      },
    }),
  ],
});
