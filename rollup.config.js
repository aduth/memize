import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
	{
		input: 'index.js',
		output: {
			format: 'umd',
			name: 'memize',
			file: 'dist/memize.js',
		},
		plugins: [
			nodeResolve({
				extensions: ['.js'],
			}),
			babel({
				extensions: ['.js'],
				babelHelpers: 'bundled',
				exclude: 'node_modules/**',
			}),
		],
	},
	{
		input: 'index.js',
		output: {
			format: 'umd',
			name: 'memize',
			file: 'dist/memize.min.js',
		},
		plugins: [
			nodeResolve({
				extensions: ['.js'],
			}),
			babel({
				babelHelpers: 'bundled',
				exclude: 'node_modules/**',
			}),
			terser(),
		],
	},
	{
		input: 'index.js',
		output: {
			format: 'cjs',
			name: 'memize',
			file: 'dist/memize.cjs',
		},
		plugins: [
			nodeResolve({
				extensions: ['.js'],
			}),
			babel({
				babelHelpers: 'bundled',
				exclude: 'node_modules/**',
			}),
		],
	},
];
