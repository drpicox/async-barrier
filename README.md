AsyncBarrier
============

Helper function to increase your expresiveness when async/await testing


Quick Use
---------

Install with npm:

```bash
npm install async-barrier
```

Just require or import the make function and create a barrier. This
barrier will ensure that all async functions reaches the desired line
at the same time.

```javascript
const makeAsyncBarrier = require("async-barrier");

test("setTimeout executes in next tick", async () => {
  const log = [];
  const barrier = makeAsyncBarrier(2);

  setTimeout(async () => {
    log.push("timeout");
    await barrier();
  });

  log.push("begin");
  await barrier();
  log.push("end");

  expect(log).toEqual(["begin", "timeout", "end"]);
});
```

By omitting the `await` keyword it can be used to define checkpoints 
and force async events to happen in the desidered order.

```javascript
const makeAsyncBarrier = require("async-barrier");

test("setTimeout executes in next tick", async () => {
  const log = [];
  const endTimeout = makeAsyncBarrier(2);

  setTimeout(async () => {
    log.push("timeout");
    endTimeout();
  });

  log.push("begin");
  await endTimeout();
  log.push("end");

  expect(log).toEqual(["begin", "timeout", "end"]);
```



Motivation
----------

Async/await are hard to test specially when we need a fine grain specification.
If you try to use promises to create checkpoints and control async execution 
order code can become difficult to read.
For example, the following code is equivalent to the previous test:

```javascript
test("setTimeout executes in next tick", async () => {
  const log = [];
  let endTimeoutResolve;
  let endTimeoutPromise = new Promise(resolve => {
    endTimeoutResolve = resolve;
  });

  setTimeout(async () => {
    log.push("timeout");
    endTimeoutResolve();
  });

  log.push("begin");
  await endTimeoutPromise;
  log.push("end");

  expect(log).toEqual(["begin", "timeout", "end"]);
});
```

makeAsyncBarrier
----------------

```javascript
const barrier = makeAsyncBarrier(2);
```

It creates a barrier function and returns it.
The argument that receives is an integer and represents
the number of times that the barrier function will be executed.
The created barrier function receives no arguments and
returns a promise.
The promise returned will be satisfied when the barrier function
is executed as many times as indicated in makeAsyncBarrier argument.


### Multiple barriers

Each barrier function created with `makeAsyncBarrier` is independent
and represents a different barrier. 
Each function will only wait for its own calls.

You can use multiple barriers to synchronize steps:

```javascript
const makeAsyncBarrier = require("async-barrier");

test("synchronize multiple steps in the correct order", async () => {
  const log = [];
  const beginStep1 = makeAsyncBarrier(2);
  const beginStep2 = makeAsyncBarrier(2);
  const endStep2 = makeAsyncBarrier(2);

  (async () => {
    await beginStep2();
    log.push("step 2");
    endStep2();
  })();
  (async () => {
    await beginStep1();
    log.push("step 1");
    beginStep2();
  })();

  log.push("begin");
  beginStep1();
  await endStep2();
  log.push("end");

  expect(log).toEqual(["begin", "step 1", "step 2", "end"]);
});
```

### Excessive calls

Once it is called as many times as indicated in `makeAsyncBarrier` 
function argument, next calls have no effect and return a resolved promise.

```javascript
const makeAsyncBarrier = require("async-barrier");

test("barrier can be called more times that specified", async () => {
  const barrier = makeAsyncBarrier(2);

  barrier();
  barrier();
  await barrier();
});
```


Don't
-----

Do not wait twice for the same barrier in the same event. It will wait forever:

```javascript
// don't do this
const barrier = makeAsyncBarrier(2);
await barrier();
await barrier();
```
