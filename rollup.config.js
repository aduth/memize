import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';

export default {
	input: 'index.js',
	output: {
		format: 'es',
		name: 'memize',
		file: 'dist/index.js',
	},
	plugins: [
		babel({
			babelHelpers: 'bundled',
			exclude: 'node_modules/**',
		}),
		replace({
			preventAssignment: true,
			values: {
				'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
			},
		}),
	],
};
