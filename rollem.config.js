import commonjs from 'rollup-plugin-commonjs';

export default [
	{
		entry: 'index.js',
		dest: 'dist/memize.js',
		moduleName: 'memize',
		format: 'iife',
		useStrict: false,
		plugins: [
			commonjs()
		]
	},
	{
		entry: 'fifo.js',
		dest: 'dist/memize.fifo.js',
		moduleName: 'memize',
		format: 'iife',
		useStrict: false,
		plugins: [
			commonjs()
		]
	}
];
