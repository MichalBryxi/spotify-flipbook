import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const nm = `${process.cwd()}/node_modules`;

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /ember-modify-based-class-resource$/,
        replacement: `${nm}/ember-modify-based-class-resource/dist/index.js`,
      },
    ],
  },
  plugins: [
    classicEmberSupport(),
    ember(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['robots.txt'],
      manifest: {
        name: 'Spotify Flipbook',
        short_name: 'Flipbook',
        description: 'Generate printable Spotify scannable track cards.',
        theme_color: '#161616',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
      },
      pwaAssets: {
        config: true,
        overrideManifestIcons: true,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
