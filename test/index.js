const assert = require( 'assert' );
const sinon = require( 'sinon' );

describe( 'memoize', () => {
	[
		[ 'lifo', '../' ],
		[ 'fifo', '../fifo' ]
	].forEach( ( [ name, path ] ) => {
		describe( name, () => {
			const memoize = require( path );
			const sandbox = sinon.sandbox.create();
			const originalAdd = ( x, y ) => x + y;
			const spiedAdd = sandbox.spy( ( x, y ) => x + y );
			let add;

			beforeEach( () => {
				sandbox.reset();
				add = memoize( spiedAdd );
			} );

			it( 'exposes cache clearing method', () => {
				assert.equal(
					typeof add.clear,
					'function'
				);
			} );

			it( 'returns the correct value', () => {
				const sum = add( 5, 7 );

				assert.equal( sum, originalAdd( 5, 7 ) );
			} );

			it( 'caches return value', () => {
				let sum;
				sum = add( 5, 7 );
				sum = add( 5, 7 );

				sinon.assert.calledOnce( spiedAdd );
				assert.equal( sum, originalAdd( 5, 7 ) );
			} );

			it( 'caches return value for non-primitive args by reference', () => {
				let sum;
				const obj = {};
				sum = add( 5, obj );
				obj.mutated = true;
				sum = add( 5, obj );

				sinon.assert.calledOnce( spiedAdd );
				assert.equal( sum, originalAdd( 5, obj ) );
			} );

			it( 'returns the correct value of differing arguments', () => {
				const firstSum = add( 5, 7 );
				const secondSum = add( 6, 8 );

				sinon.assert.calledTwice( spiedAdd );
				assert.equal( firstSum, originalAdd( 5, 7 ) );
				assert.equal( secondSum, originalAdd( 6, 8 ) );
			} );

			it( 'returns the cached value on non-subsequent calls', () => {
				add( 5, 7 );
				add( 6, 8 );
				add( 5, 7 );

				sinon.assert.calledTwice( spiedAdd );
				assert.deepEqual( spiedAdd.getCall( 0 ).args, [ 5, 7 ] );
				assert.deepEqual( spiedAdd.getCall( 1 ).args, [ 6, 8 ] );
			} );

			it( 'clears cache', () => {
				add( 5, 7 );
				add.clear();
				add( 5, 7 );

				sinon.assert.calledTwice( spiedAdd );
			} );

			it( 'caches with maxSize', () => {
				add = memoize( spiedAdd, { maxSize: 2 } );

				// cache MISS [ [ 1, 2 ] ]
				assert.equal( add( 1, 2 ), originalAdd( 1, 2 ) );
				sinon.assert.callCount( spiedAdd, 1 );

				// cache MISS [ [ 1, 2 ], [ 3, 4 ] ]
				assert.equal( add( 3, 4 ), originalAdd( 3, 4 ) );
				sinon.assert.callCount( spiedAdd, 2 );

				// cache MISS [ [ 3, 4 ], [ 5, 6 ] ]
				assert.equal( add( 5, 6 ), originalAdd( 5, 6 ) );
				sinon.assert.callCount( spiedAdd, 3 );

				// cache MISS [ [ 5, 6 ], [ 1, 2 ] ]
				assert.equal( add( 1, 2 ), originalAdd( 1, 2 ) );
				sinon.assert.callCount( spiedAdd, 4 );

				// cache HIT [ [ 1, 2 ], [ 5, 6 ] ]
				assert.equal( add( 5, 6 ), originalAdd( 5, 6 ) );
				sinon.assert.callCount( spiedAdd, 4 );

				// cache HIT [ [ 5, 6 ], [ 1, 2 ] ]
				assert.equal( add( 1, 2 ), originalAdd( 1, 2 ) );
				sinon.assert.callCount( spiedAdd, 4 );

				// cache MISS [ [ 1, 2 ], [ 3, 4 ] ]
				assert.equal( add( 3, 4 ), originalAdd( 3, 4 ) );
				sinon.assert.callCount( spiedAdd, 5 );
			} );
		} );
	} );
} );
