const replace = require( 'rollup-plugin-replace' );
const commonjs = require( 'rollup-plugin-commonjs' );

export default {
	entry: 'index.js',
	dest: 'dist/memize.js',
	moduleName: 'memize',
	format: 'iife',
	plugins: [
		replace( {
			'process.env.NODE_ENV': JSON.stringify( process.env.NODE_ENV )
		} ),
		commonjs()
	]
};
