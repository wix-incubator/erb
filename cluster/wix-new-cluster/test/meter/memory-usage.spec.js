const expect = require('chai').expect,
  MemoryUsage = require('../../lib/meter/memory-usage'),
  memoryUsage = MemoryUsage.usage,
  tickMs = MemoryUsage.interval,
  sinon = require('sinon');

describe('memory usage', () => {
  const toMB = 1024 * 1024;
  let stop;

  afterEach(() => stop && stop());

  it('should report memory usage immediately', sinon.test(function () {
    const processUsage = {rss: toMB, heapTotal: 2 * toMB, heapUsed: 3 * toMB};
    let returnedUsage = {};
    const expectedUsage = {rss: 1, heapTotal: 2, heapUsed: 3};

    this.stub(process, 'memoryUsage').returns(processUsage);
    stop = memoryUsage(usage => returnedUsage = usage);

    expect(returnedUsage).to.deep.equal(expectedUsage);
  }));


  it('should report memory usage', sinon.test(function () {
    const returnedUsages = [];
    this.stub(process, 'memoryUsage')
      .onFirstCall().returns({rss: toMB, heapTotal: 2 * toMB, heapUsed: 3 * toMB})
      .onSecondCall().returns({rss: 10 * toMB, heapTotal: 20 * toMB, heapUsed: 30 * toMB});

    stop = memoryUsage(usage => returnedUsages.push(usage));

    this.clock.tick(tickMs);

    expect(returnedUsages[0]).to.deep.equal({rss: 1, heapTotal: 2, heapUsed: 3});
    expect(returnedUsages[1]).to.deep.equal({rss: 10, heapTotal: 20, heapUsed: 30});
  }));

  it('should report event loop duration periodically', sinon.test(function () {
    let runCount = 0;
    const ticks = 3;

    stop = memoryUsage(() => runCount++);

    this.clock.tick(tickMs * ticks);

    expect(runCount).to.equal(ticks + 1);
  }));

  it('should stop timer upon returned function invocation', sinon.test(function () {
    let runCount = 0;

    stop = memoryUsage(() => runCount++);

    this.clock.tick(tickMs);
    stop();
    this.clock.tick(tickMs);

    expect(runCount).to.equal(2);
  }));
});