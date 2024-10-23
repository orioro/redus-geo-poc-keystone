import PACKAGE_JSON from '../package.json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { babel } from '@rollup/plugin-babel'

const DEPENDENCY_NAMES = Object.keys(PACKAGE_JSON.dependencies)

export default {
  input: 'mod/src/index.js', // Entry point of your application
  output: [
    {
      file: 'mod/dist/index.js',
      format: 'cjs',
    },
    {
      file: 'mod/dist/index.mjs',
      format: 'esm',
    },
  ],
  external: (id) => {
    return (
      // id.includes('node_modules') ||
      DEPENDENCY_NAMES.some((name) => id.startsWith(name))
    )
  },
  plugins: [
    nodeResolve({
      extensions: ['.mjs', '.js', '.ts', '.json', '.node'],
    }),
    commonjs(),
    babel({ exclude: 'node_modules/**', babelHelpers: 'bundled' }),
  ],
}
