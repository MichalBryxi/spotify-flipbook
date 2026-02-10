import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';

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
    ember(), // extra plugins here
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
    tailwindcss(),
  ],
});
