const replace = require( 'rollup-plugin-replace' );
const commonjs = require( 'rollup-plugin-commonjs' );

export default {
	input: 'index.js',
	output: {
		'file': __dirname + '/dist/memize.js',
		format: 'iife',
		name: 'memize',
	},
	plugins: [
		replace( {
			'process.env.NODE_ENV': JSON.stringify( process.env.NODE_ENV )
		} ),
		commonjs()
	]
};
