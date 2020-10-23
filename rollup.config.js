import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import del from "rollup-plugin-delete"
import { terser } from "rollup-plugin-terser";
import gzipPlugin from 'rollup-plugin-gzip'
const bundleSize = require('rollup-plugin-bundle-size');
const pkg = require('./package.json');

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.homepage}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * Released under the ${pkg.license} license
 * ${pkg.description}
 */`;

const plugins = [
  nodeResolve(),
  commonjs(),
  bundleSize(),
];

const plugins2 = [
  nodeResolve(),
  commonjs(),
  del(),
  terser(),
  bundleSize(),
];

const plugins3 = [
  nodeResolve(),
  commonjs(),
  del(),
  gzipPlugin(),
  bundleSize(),
];


export default [
  {
    input: 'src/main.js',
    output: {
      file: 'dist/graph-chartjs-card.js',
      banner: banner,
      format: 'umd',
      indent: false,
      sourcemap: false,
      name: 'graph-chartjs-card'
    },
    plugins: [...plugins],
  },
  {
    input: 'src/main.js',
    output: {
      file: 'dist/graph-chartjs-card.min.js',
      banner: banner,
      format: 'umd',
      indent: false,
      sourcemap: false,
      name: 'graph-chartjs-card'
    },
    plugins: [...plugins2],
  }
];
