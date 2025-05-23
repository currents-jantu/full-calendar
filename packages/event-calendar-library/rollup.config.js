import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import dts from 'rollup-plugin-dts';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const packageJson = require('./package.json');

export default [
  {
    input: 'src/index.ts', // Your library's entry point
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json', exclude: ["**/node_modules/**", "**/dist/**"] }),
      postcss({
        config: {
          path: './postcss.config.js', // Create this file next
        },
        extensions: ['.css'],
        minimize: true,
        inject: {
          insertAt: 'top',
        },
        plugins: [
          tailwindcss(require('./tailwind.config.js')), // Create this file next
          autoprefixer,
        ],
      }),
    ],
    external: Object.keys(packageJson.peerDependencies || {}), // Automatically externalize peerDependencies
  },
  {
    input: 'dist/esm/types/index.d.ts', // Path to your generated .d.ts files
    output: [{ file: packageJson.types, format: 'esm' }],
    plugins: [dts()],
     external: [/\.css$/], // Ignore CSS files for type bundling
  },
];
