const makeAsyncBarrier = require("../");

describe("Promise withoutMakeAsyncBarrier", () => {
  it("creates synchronize async events", async () => {
    const log = [];

    let beginTimeoutResolve;
    let beginTimeoutPromise = new Promise(resolve => {
      beginTimeoutResolve = resolve;
    });
    let startedTimeoutResolve;
    let startedTimeoutPromise = new Promise(resolve => {
      startedTimeoutResolve = resolve;
    });

    const barrier = makeAsyncBarrier(2);

    setTimeout(async () => {
      log.push("begin timeout");
      await beginTimeoutPromise;
      startedTimeoutResolve();
      log.push("end timeout");
    });

    log.push("begin");
    beginTimeoutResolve();
    await startedTimeoutPromise;
    log.push("end");

    expect(log).toEqual(["begin", "begin timeout", "end timeout", "end"]);
  });

  it("creates barriers that can synchronize multiple events", async () => {
    const log = [];
    let endTimeout1Resolve;
    let endTimeout1Promise = new Promise(resolve => {
      endTimeout1Resolve = resolve;
    });
    let endTimeout2Resolve;
    let endTimeout2Promise = new Promise(resolve => {
      endTimeout2Resolve = resolve;
    });

    setTimeout(async () => {
      log.push("timeout");
      endTimeout1Resolve();
    });

    setTimeout(async () => {
      log.push("timeout");
      endTimeout2Resolve();
    });

    log.push("begin");
    await endTimeout1Promise;
    await endTimeout2Promise;
    log.push("end");

    expect(log).toEqual(["begin", "timeout", "timeout", "end"]);
  });

  it("can be used to create 'checkpoints'", async () => {
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

  it("creates as many as desired barriers", async () => {
    const log = [];
    let beginStep1Resolve;
    let beginStep1Promise = new Promise(resolve => {
      beginStep1Resolve = resolve;
    });
    let beginStep2Resolve;
    let beginStep2Promise = new Promise(resolve => {
      beginStep2Resolve = resolve;
    });
    let endStep2Resolve;
    let endStep2Promise = new Promise(resolve => {
      endStep2Resolve = resolve;
    });

    (async () => {
      await beginStep2Promise;
      log.push("step 2");
      endStep2Resolve();
    })();
    (async () => {
      await beginStep1Promise;
      log.push("step 1");
      beginStep2Resolve();
    })();

    log.push("begin");
    beginStep1Resolve();
    await endStep2Promise;
    log.push("end");

    expect(log).toEqual(["begin", "step 1", "step 2", "end"]);
  });
});
