import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';

export default {
	input: 'index.js',
	output: {
		'file': __dirname + '/dist/memize.js',
		format: 'iife',
		name: 'memize',
	},
	plugins: [
		replace( {
			preventAssignment: true,
			values: {
				'process.env.NODE_ENV': JSON.stringify( process.env.NODE_ENV )
			},
		} ),
		commonjs()
	]
};
