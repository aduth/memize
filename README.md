Memize
======

Memize is a unabashedly-barebones memoization library with an aim toward speed. By all accounts, Memize is __the fastest memoization implementation__ in JavaScript (see [benchmarks](#benchmarks), [how it works](#how-it-works)). It supports multiple arguments, including non-primitive arguments (by reference). All this weighing in at less than 0.3kb minified and gzipped, with no dependencies.

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

[https://unpkg.com/memize/dist/memize.min.js](https://unpkg.com/memize/dist/memize.min.js)

## Usage

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

The following benchmarks are performed in Node 10.16.0 on a MacBook Pro (2019), 2.4 GHz 8-Core Intel Core i9, 32 GB 2400 MHz DDR4 RAM.

__Single argument__

Name               | Ops / sec   | Relative margin of error | Sample size
-------------------|-------------|--------------------------|------------
fast-memoize       | 360,812,575 | ± 0.55%                  | 87         
memize             | 128,909,282 | ± 1.06%                  | 87         
moize              | 102,858,648 | ± 0.66%                  | 88         
lru-memoize        | 71,589,564  | ± 0.90%                  | 88         
lodash             | 49,575,743  | ± 1.00%                  | 88         
underscore         | 35,805,268  | ± 0.86%                  | 88         
memoizee           | 35,357,004  | ± 0.55%                  | 87         
moize (serialized) | 27,246,184  | ± 0.88%                  | 87         
memoizerific       | 8,647,735   | ± 0.91%                  | 91         
ramda              | 8,011,334   | ± 0.74%                  | 90         
memoizejs          | 2,111,745   | ± 0.52%                  | 88         

_**\* Note**: `fast-memoize` uses [`Function.length`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/length) to optimize for singular argument functions, which [can yield unexpected behavior](https://github.com/caiogondim/fast-memoize.js#rest--default-parameters) if not account for._

__Multiple arguments (primitive)__

Name               | Ops / sec  | Relative margin of error | Sample size
-------------------|------------|--------------------------|------------
memize             | 81,460,517 | ± 0.61%                  | 88         
moize              | 66,896,395 | ± 0.90%                  | 83         
lru-memoize        | 26,315,198 | ± 1.26%                  | 85         
memoizee           | 18,237,056 | ± 0.60%                  | 90         
moize (serialized) | 15,207,105 | ± 0.78%                  | 84         
memoizerific       | 6,363,555  | ± 0.63%                  | 88         
memoizejs          | 1,764,673  | ± 0.57%                  | 90         
fast-memoize       | 1,560,421  | ± 0.72%                  | 87         

__Multiple arguments (non-primitive)__

Name               | Ops / sec  | Relative margin of error | Sample size
-------------------|------------|--------------------------|------------
memize             | 79,105,918 | ± 0.81%                  | 86         
moize              | 62,374,610 | ± 0.55%                  | 87         
lru-memoize        | 24,814,747 | ± 0.54%                  | 89         
memoizee           | 12,119,005 | ± 0.47%                  | 89         
memoizerific       | 6,748,675  | ± 0.66%                  | 88         
moize (serialized) | 2,027,250  | ± 1.07%                  | 87         
fast-memoize       | 1,263,457  | ± 1.00%                  | 89         
memoizejs          | 1,075,690  | ± 0.61%                  | 87         

## How it works

If you haven't already, feel free to [glance over the source code](./index.js). The code is heavily commented and should help provide substance to the implementation concepts.

Memize creates a [last-in first-out stack](https://en.wikipedia.org/wiki/Stack_(abstract_data_type)) implemented as a [doubly linked list](https://en.wikipedia.org/wiki/Doubly_linked_list). It biases recent access favoring real-world scenarios where the function is subsequently invoked multiple times with the same arguments. The choice to implement as a linked list is due to dramatically better performance characteristics compared to `Array#unshift` for surfacing an entry to the head of the list ([jsperf](https://jsperf.com/array-unshift-linked-list)). A downside of linked lists is inability to efficiently access arbitrary indices, but iterating from the beginning of the cache list is optimized by guaranteeing the list is sorted by recent access / insertion.

Each node in the list tracks the original arguments as an array. This acts as a key of sorts, matching arguments of the current invocation by performing a shallow equality comparison on the two arrays. Other memoization implementations often use `JSON.stringify` to generate a string key for lookup in an object cache, but this benchmarks much slower than a shallow comparison ([jsperf](https://jsperf.com/lookup-json-stringify-vs-shallow-equality)).

Finally, special care is made toward treatment of `arguments` due to engine-specific deoptimizations which can occur in V8 via [arguments leaking](https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments). Order is important here; we only create a shallow clone when necessary, after the cache has been checked, to avoid creating a clone unnecessarily if a cache entry exists. Looking at the code, you'd not be blamed for thinking that dropping the shallow clone would improve performance, but in fact it would _slow_ execution by approximately 60%. This is due to how the lingering `arguments` reference would carry over by reference ("leaks") in the node's `args` property. _**Update:** As of November 2019, engine improvements are such that `arguments` leaking does not have as dramatic an effect. However, my testing shows that the shallow clone still performs equal or better than referencing `arguments` directly, and as such the implementation has not been revised in order to achieve optimal performance in the most versions of V8._

## License

Copyright 2018-2020 Andrew Duthie

Released under the [MIT License](./LICENSE.md).
