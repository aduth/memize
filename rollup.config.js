const babel = require('@rollup/plugin-babel');
const replace = require('@rollup/plugin-replace');

module.exports = {
	input: 'index.mjs',
	output: {
		format: 'es',
		name: 'memize',
		file: 'dist/index.mjs',
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
