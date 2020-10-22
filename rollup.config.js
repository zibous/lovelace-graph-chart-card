import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import del from "rollup-plugin-delete"
import { terser } from "rollup-plugin-terser";

const plugins = [
  nodeResolve(),
  commonjs()
];

const plugins2 = [
  nodeResolve(),
  commonjs(),
  del(),
  terser(),
];


export default [
  {
    input: 'src/main.js',
    output: {
      file: 'dist/graph-chartjs-card.js',
      format: 'umd',
      name: 'graph-chartjs-card'
    },
    plugins: [...plugins],
  },
];
