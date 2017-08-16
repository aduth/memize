const commonjs = require( 'rollup-plugin-commonjs' );

export default {
	entry: 'index.js',
	dest: 'dist/memize.js',
	moduleName: 'memize',
	format: 'iife',
	plugins: [
		commonjs()
	]
};
