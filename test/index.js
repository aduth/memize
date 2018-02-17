const assert = require( 'assert' );
const sinon = require( 'sinon' );
const memoize = require( '../' );

describe( 'memoize', () => {
	const sandbox = sinon.sandbox.create();
	const originalAdd = ( x, y = 0 ) => x + y;
	const spiedAdd = sandbox.spy( originalAdd );
	let add;

	beforeEach( () => {
		sandbox.reset();
		add = memoize( spiedAdd );
	} );

	it( 'exposes cache clearing method', () => {
		assert.strictEqual(
			typeof add.clear,
			'function'
		);
	} );

	it( 'returns the correct value', () => {
		const sum = add( 5, 7 );

		assert.strictEqual( sum, originalAdd( 5, 7 ) );
	} );

	it( 'caches return value', () => {
		let sum;
		sum = add( 5, 7 );
		sum = add( 5, 7 );

		sinon.assert.calledOnce( spiedAdd );
		assert.strictEqual( sum, originalAdd( 5, 7 ) );
		const [ head, tail, size ] = add.getCache();
		assert.strictEqual( size, 1 );
		assert.strictEqual( head, tail );
		assert.strictEqual( head.val, 12 );
		assert.deepEqual( head.args, [ 5, 7 ] );
		assert.equal( head.prev, null );
		assert.equal( head.next, null );
	} );

	it( 'caches return value for non-primitive args by reference', () => {
		let sum;
		const obj = {};
		sum = add( 5, obj );
		obj.mutated = true;
		sum = add( 5, obj );

		sinon.assert.calledOnce( spiedAdd );
		assert.strictEqual( sum, originalAdd( 5, obj ) );
		const [ head, tail, size ] = add.getCache();
		assert.strictEqual( size, 1 );
		assert.strictEqual( head, tail );
		assert.strictEqual( head.val, '5[object Object]' );
		assert.deepEqual( head.args, [ 5, obj ] );
		assert.equal( head.prev, null );
		assert.equal( head.next, null );
	} );

	it( 'returns the correct value of differing arguments', () => {
		const firstSum = add( 5, 7 );
		const secondSum = add( 6, 8 );

		sinon.assert.calledTwice( spiedAdd );
		assert.strictEqual( firstSum, originalAdd( 5, 7 ) );
		assert.strictEqual( secondSum, originalAdd( 6, 8 ) );
		const [ head, tail, size ] = add.getCache();
		assert.strictEqual( size, 2 );
		assert.notStrictEqual( head, tail );
		assert.strictEqual( head.val, 14 );
		assert.deepEqual( head.args, [ 6, 8 ] );
		assert.equal( head.prev, null );
		assert.strictEqual( head.next.val, 12 );
		assert.deepEqual( head.next.args, [ 5, 7 ] );
		assert.strictEqual( head.next.prev, head );
		assert.equal( head.next.next, null );
	} );

	it( 'returns the cached value on non-subsequent calls', () => {
		add( 5, 7 );
		add( 6, 8 );
		add( 5, 7 );

		sinon.assert.calledTwice( spiedAdd );
		assert.deepEqual( spiedAdd.getCall( 0 ).args, [ 5, 7 ] );
		assert.deepEqual( spiedAdd.getCall( 1 ).args, [ 6, 8 ] );
		const [ head, tail, size ] = add.getCache();
		assert.strictEqual( size, 2 );
		assert.notStrictEqual( head, tail );
		assert.strictEqual( head.val, 12 );
		assert.deepEqual( head.args, [ 5, 7 ] );
		assert.equal( head.prev, null );
		assert.strictEqual( head.next.val, 14 );
		assert.deepEqual( head.next.args, [ 6, 8 ] );
		assert.strictEqual( head.next.prev, head );
		assert.equal( head.next.next, null );
	} );

	it( 'clears cache', () => {
		add( 5, 7 );
		add.clear();
		add( 5, 7 );

		sinon.assert.calledTwice( spiedAdd );
		const [ head, tail, size ] = add.getCache();
		assert.strictEqual( size, 1 );
		assert.strictEqual( head, tail );
		assert.strictEqual( head.val, 12 );
		assert.deepEqual( head.args, [ 5, 7 ] );
		assert.equal( head.prev, null );
		assert.equal( head.next, null );
	} );

	it( 'caches with maxSize', () => {
		let head, tail, size;
		add = memoize( spiedAdd, { maxSize: 2 } );

		// Cache MISS [ [ 1, 2 ] ]
		assert.strictEqual( add( 1, 2 ), originalAdd( 1, 2 ) );
		sinon.assert.callCount( spiedAdd, 1 );
		( [ head, tail, size ] = add.getCache() );
		assert.strictEqual( size, 1 );
		assert.strictEqual( head, tail );
		assert.strictEqual( head.val, 3 );
		assert.deepEqual( head.args, [ 1, 2 ] );
		assert.equal( head.prev, null );
		assert.equal( head.next, null );

		// Cache MISS [ [ 3, 4 ], [ 1, 2 ] ]
		assert.strictEqual( add( 3, 4 ), originalAdd( 3, 4 ) );
		sinon.assert.callCount( spiedAdd, 2 );
		( [ head, tail, size ] = add.getCache() );
		assert.strictEqual( size, 2 );
		assert.notStrictEqual( head, tail );
		assert.strictEqual( head.val, 7 );
		assert.deepEqual( head.args, [ 3, 4 ] );
		assert.equal( head.prev, null );
		assert.strictEqual( head.next, tail );
		assert.strictEqual( head.next.val, 3 );
		assert.deepEqual( head.next.args, [ 1, 2 ] );
		assert.strictEqual( head.next.prev, head );
		assert.equal( head.next.next, null );

		// Cache MISS [ [ 5, 6 ], [ 3, 4 ] ]
		assert.strictEqual( add( 5, 6 ), originalAdd( 5, 6 ) );
		sinon.assert.callCount( spiedAdd, 3 );
		( [ head, tail, size ] = add.getCache() );
		assert.strictEqual( size, 2 );
		assert.notStrictEqual( head, tail );
		assert.strictEqual( head.val, 11 );
		assert.deepEqual( head.args, [ 5, 6 ] );
		assert.equal( head.prev, null );
		assert.strictEqual( head.next, tail );
		assert.strictEqual( head.next.val, 7 );
		assert.deepEqual( head.next.args, [ 3, 4 ] );
		assert.equal( head.next.next, null );

		// Cache MISS [ [ 1, 2 ], [ 5, 6 ] ]
		assert.strictEqual( add( 1, 2 ), originalAdd( 1, 2 ) );
		sinon.assert.callCount( spiedAdd, 4 );
		( [ head, tail, size ] = add.getCache() );
		assert.strictEqual( size, 2 );
		assert.notStrictEqual( head, tail );
		assert.strictEqual( head.val, 3 );
		assert.deepEqual( head.args, [ 1, 2 ] );
		assert.equal( head.prev, null );
		assert.strictEqual( head.next, tail );
		assert.strictEqual( head.next.val, 11 );
		assert.deepEqual( head.next.args, [ 5, 6 ] );
		assert.equal( head.next.next, null );

		// Cache HIT [ [ 5, 6 ], [ 1, 2 ] ]
		assert.strictEqual( add( 5, 6 ), originalAdd( 5, 6 ) );
		sinon.assert.callCount( spiedAdd, 4 );
		( [ head, tail, size ] = add.getCache() );
		assert.strictEqual( size, 2 );
		assert.notStrictEqual( head, tail );
		assert.strictEqual( head.val, 11 );
		assert.deepEqual( head.args, [ 5, 6 ] );
		assert.equal( head.prev, null );
		assert.strictEqual( head.next, tail );
		assert.strictEqual( head.next.val, 3 );
		assert.deepEqual( head.next.args, [ 1, 2 ] );
		assert.equal( head.next.next, null );

		// Cache HIT [ [ 1, 2 ], [ 5, 6 ] ]
		assert.strictEqual( add( 1, 2 ), originalAdd( 1, 2 ) );
		sinon.assert.callCount( spiedAdd, 4 );
		( [ head, tail, size ] = add.getCache() );
		assert.strictEqual( size, 2 );
		assert.notStrictEqual( head, tail );
		assert.strictEqual( head.val, 3 );
		assert.deepEqual( head.args, [ 1, 2 ] );
		assert.equal( head.prev, null );
		assert.strictEqual( head.next, tail );
		assert.strictEqual( head.next.val, 11 );
		assert.deepEqual( head.next.args, [ 5, 6 ] );
		assert.equal( head.next.next, null );

		// Cache MISS [ [ 3, 4 ], [ 1, 2 ] ]
		assert.strictEqual( add( 3, 4 ), originalAdd( 3, 4 ) );
		sinon.assert.callCount( spiedAdd, 5 );
		( [ head, tail, size ] = add.getCache() );
		assert.strictEqual( size, 2 );
		assert.notStrictEqual( head, tail );
		assert.strictEqual( head.val, 7 );
		assert.deepEqual( head.args, [ 3, 4 ] );
		assert.equal( head.prev, null );
		assert.strictEqual( head.next, tail );
		assert.strictEqual( head.next.val, 3 );
		assert.deepEqual( head.next.args, [ 1, 2 ] );
		assert.equal( head.next.next, null );
	} );

	it( 'shifts tail on cache hit, only on non-head', () => {
		// Reason: Covers previous error where tail would shift when also head,
		// causing tail to become assigned as undefined. This becomes relevant
		// with `maxSize`, when attempting to drop the tail on cache insert.
		let head, tail, size;
		add = memoize( spiedAdd, { maxSize: 1 } );

		add( 1, 2 );
		( [ head, tail, size ] = add.getCache() );
		assert.strictEqual( size, 1 );
		assert.strictEqual( head, tail );
		assert.strictEqual( head.val, 3 );
		assert.equal( head.prev, null );
		assert.equal( head.next, null );
		add( 1, 2 );
		( [ head, tail, size ] = add.getCache() );
		assert.strictEqual( size, 1 );
		assert.strictEqual( head, tail );
		assert.strictEqual( head.val, 3 );
		assert.equal( head.prev, null );
		assert.equal( head.next, null );
		add( 3, 4 );
		( [ head, tail, size ] = add.getCache() );
		assert.strictEqual( size, 1 );
		assert.strictEqual( head, tail );
		assert.strictEqual( head.val, 7 );
		assert.equal( head.prev, null );
		assert.equal( head.next, null );

		sinon.assert.calledTwice( spiedAdd );
	} );

	it( 'ensures equal argument length before returning cache', () => {
		const sums = [
			add( 5, 7 ),
			add( 5 ),
		];

		sinon.assert.calledTwice( spiedAdd );
		assert.strictEqual( sums[ 0 ], 12 );
		assert.strictEqual( sums[ 1 ], 5 );
	} );
} );
