## Benchmarks

### Running Benchmarks

To run the benchmark script:

```
npm run benchmark
```

### Benchmark Results (2019)

The following benchmark results which are outdated and may not accurately reflect all scenarios, so you're encouraged to run the benchmarks yourself or perform performance analysis in your own application.

In particular:

- Because Memize is implemented as a least recently used (LRU) cache, it is optimized for scenarios where the function is called repeatedly with the same arguments. If arguments are less predictable in your usage, the performance benefit may not be as great.
- The included benchmarking script is naive and does not incorporate any randomization of arguments.

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