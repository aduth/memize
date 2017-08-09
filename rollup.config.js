var commonjs = require( 'rollup-plugin-commonjs' );

module.exports = {
	entry: 'index.js',
	dest: 'dist/memize.js',
	moduleName: 'memize',
	format: 'iife',
	plugins: [
		commonjs()
	]
};
