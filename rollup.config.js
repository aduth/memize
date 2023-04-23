import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';

const commonConfig = {
	input: 'index.js',
	plugins: [
		babel({
			babelHelpers: 'bundled',
			exclude: 'node_modules/**',
		}),
	],
};
export default [
	{
		...commonConfig,
		output: {
			format: 'cjs',
			name: 'memize',
			file: 'dist/memize.cjs',
		},
	},
	{
		...commonConfig,
		output: {
			format: 'es',
			name: 'memize',
			file: 'dist/memize.js',
		},
		plugins: [
			...commonConfig.plugins,
			replace({
				preventAssignment: true,
				values: {
					'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
				},
			}),
		],
	},
];
