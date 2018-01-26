module.exports = function makeAsyncBarrier(count) {
  var barrierCalls = 0;
  var barrierResolve;
  var barrierPromise = new Promise(function(resolve) {
    barrierResolve = resolve;
  });

  return function barrier() {
    barrierCalls++;
    if (barrierCalls === count) {
      barrierResolve();
    }
    return barrierPromise;
  };
};
