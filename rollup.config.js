import replace from '@rollup/plugin-replace';

export default {
	input: 'index.js',
	output: {
		format: 'es',
		name: 'memize',
		file: 'dist/index.js',
	},
	plugins: [
		replace({
			preventAssignment: true,
			values: {
				'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
			},
		}),
	],
};
