Memize
======

Memize is a unabashedly-barebones memoization library with an aim toward speed. By all accounts, Memize is __the fastest memoization implementation__ in JavaScript (see [benchmarks](#benchmarks), [how it works](#how-it-works)). It supports multiple arguments, including non-primitive arguments (by reference). All this weighing in at less than 0.3kb minified and gzipped, with no dependencies.

Included are two separate implementations which have different performance characteristics best determined by your real-world requirements. The default implementation is a [last-in first-out (LIFO) stack](https://en.wikipedia.org/wiki/Stack_(abstract_data_type)) optimized for repeated calls with the same arguments, biasing recent access. In cases where memoized invocations aren't predictable, you may find that the [first-in first-out (FIFO) queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) has superior performance. See the [benchmarks](#benchmarks) section for more information.

## Example

Simply pass your original function as an argument to Memize. The return value is a new, memoized function.

```js
function fibonacci( number ) {
	if ( number < 2 ) {
		return number;
	}

	return fibonacci( number - 1 ) + fibonacci( number - 2 );
}

var memoizedFibonacci = memize( fibonacci );

memoizedFibonnaci( 8 ); // Invoked, cached, and returned
memoizedFibonnaci( 8 ); // Returned from cache
memoizedFibonnaci( 5 ); // Invoked, cached, and returned
memoizedFibonnaci( 8 ); // Returned from cache
```

## Installation

Using [npm](https://www.npmjs.com/) as a package manager:

```
npm install memize
```

Otherwise, download a pre-built copy from unpkg:

- LIFO (default): [https://unpkg.com/memize/dist/memize.min.js](https://unpkg.com/memize/dist/memize.min.js)
- FIFO: [https://unpkg.com/memize/dist/memize.fifo.min.js](https://unpkg.com/memize/dist/memize.fifo.min.js)

## Usage

Require or import your desired implementation:

**LIFO:** (default)

```
const memize = require( 'memize' );
```

**FIFO:**

```
const memize = require( 'memize/fifo' );
```

Memize accepts a function to be memoized, and returns a new memoized function.

```
memize( fn: Function, options: ?{
	maxSize?: number
} ): Function
```

Optionally, pass an options object with `maxSize` defining the maximum size of the cache.

The memoized function exposes a `clear` function if you need to reset the cache:

```js
memoizedFn.clear();
```

## Benchmarks

The following benchmarks are performed in Node 8.2.1 on a MacBook Pro (Late 2016), 2.9 GHz Intel Core i7. Lodash, Underscore, and Ramda are only included in the first benchmark because they do not support multiple argument memoization.

__Single argument__

![Benchmark](https://cldup.com/BbpWXvSdjR.png)

| Name               | Ops / sec  | Relative margin of error |
| -------------------|------------|------------------------- |
| memize             | 70,051,132 | ± 0.70%                  |
| moize              | 37,436,247 | ± 1.09%                  |
| fast-memoize       | 29,782,279 | ± 0.53%                  |
| moize (serialized) | 14,803,756 | ± 0.79%                  |
| underscore         | 13,626,860 | ± 0.64%                  |
| lru-memoize        | 11,411,453 | ± 1.36%                  |
| memoizee           | 10,907,357 | ± 0.95%                  |
| lodash             | 10,030,070 | ± 0.71%                  |
| memoizerific       | 2,105,290  | ± 0.95%                  |
| memoizejs          | 1,447,269  | ± 0.69%                  |

__Multiple arguments (primitive)__

![Benchmark](https://cldup.com/R5LPxwxpAH.png)

| Name               | Ops / sec  | Relative margin of error |
| -------------------|------------|------------------------- |
| memize             | 61,267,529 | ± 1.09%                  |
| moize              | 21,776,270 | ± 1.17%                  |
| moize (serialized) | 11,333,415 | ± 0.65%                  |
| lru-memoize        | 8,699,146  | ± 1.45%                  |
| memoizee           | 8,378,347  | ± 0.56%                  |
| memoizerific       | 1,488,700  | ± 0.83%                  |
| memoizejs          | 1,270,654  | ± 0.75%                  |
| fast-memoize       | 829,686    | ± 0.78%                  |


__Multiple arguments (non-primitive)__

![Benchmark](https://cldup.com/RYJPiEQxC5.png)

| Name               | Ops / sec  | Relative margin of error |
| -------------------|------------|------------------------- |
| memize             | 63,173,815 | ± 0.94%                  |
| moize              | 22,757,300 | ± 0.94%                  |
| lru-memoize        | 8,604,499  | ± 1.45%                  |
| memoizee           | 8,174,675  | ± 0.61%                  |
| moize (serialized) | 1,779,956  | ± 0.79%                  |
| memoizerific       | 1,442,456  | ± 1.53%                  |
| memoizejs          | 918,693    | ± 0.78%                  |
| fast-memoize       | 705,157    | ± 0.65%                  |


## How it works

If you haven't already, feel free to [glance over the source code](./index.js). It's fewer than 100 lines of code of heavily commented code, and should help provide substance to the implementation concepts.

Memize creates its cache as an array where each member is a tuple of arguments and the cached result. Cache lookup occurs by performing a shallow equality comparison between arguments of the current invocation and the cached arguments. Other memoization implementations often use `JSON.stringify` to generate a string key for lookup in an object cache, but this benchmarks much slower than a shallow comparison ([jsperf](https://jsperf.com/lookup-json-stringify-vs-shallow-equality)).

Special care is made toward treatment of `arguments` due to engine-specific deoptimizations which can occur in V8 via [arguments leaking](https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments). Order is important here; we only create a shallow clone when necessary, after the cache has been checked, to avoid creating a clone unnecessarily if a cache entry exists. Looking at the code, you'd not be blamed for thinking that dropping the shallow clone would improve performance, but in fact it would _slow_ execution significantly. This is due to how the lingering `arguments` reference would carry over by reference ("leak") in the node's `args` property.

## License

Copyright 2017 Andrew Duthie

Released under the [MIT License](./LICENSE.md).
