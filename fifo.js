module.exports = function memize( fn, options ) {
	var cache = [],
		maxSize;

	if ( options && options.maxSize > 0 ) {
		maxSize = options.maxSize;
	}

	function memoized( /* ...args */ ) {
		searchCache: for ( var i = 0; i < cache.length; i++ ) {
			// Check whether cached arguments match current invocation
			for ( var j = 0; j < arguments.length; j++ ) {
				if ( cache[ i ][ 0 ][ j ] !== arguments[ j ] ) {
					continue searchCache;
				}

				// At this point, a assume a match is found and return
				return cache[ i ][ 1 ];
			}
		}

		// No cached value found. Continue to insertion phase:

		// Create a copy of arguments (avoid leaking deoptimization)
		var args = [];
		for ( i = 0; i < arguments.length; i++ ) {
			args.push( arguments[ i ] );
		}

		// Generate the result from original function
		var result = fn.apply( null, args );
		cache.push( [ args, result ] );

		// Trim if we're reached max size and are pending cache insertion
		if ( cache.length > maxSize ) {
			cache = cache.slice( 1 );
		}

		return result;
	}

	memoized.clear = function() {
		cache = [];
	};

	return memoized;
};
