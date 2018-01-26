const makeAsyncBarrier = require("../");

describe("makeAsyncBarrier", () => {
  it("creates a barrier to synchronize async events", async () => {
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

  it("creates barriers that can synchronize multiple events", async () => {
    const log = [];
    const barrier = makeAsyncBarrier(3);

    setTimeout(async () => {
      log.push("timeout");
      await barrier();
    });

    setTimeout(async () => {
      log.push("timeout");
      await barrier();
    });

    log.push("begin");
    await barrier();
    log.push("end");

    expect(log).toEqual(["begin", "timeout", "timeout", "end"]);
  });

  it("can be used to create 'checkpoints'", async () => {
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
  });

  it("creates as many as desired barriers", async () => {
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

  it("is ok to call barrier more times than intended", async () => {
    const barrier = makeAsyncBarrier(2);

    barrier();
    barrier();
    await barrier();
  });
});
