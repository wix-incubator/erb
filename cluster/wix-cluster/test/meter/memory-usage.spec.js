const expect = require('chai').use(require('sinon-chai')).expect,
  MemoryUsage = require('../../lib/meter/memory-usage'),
  sinon = require('sinon');

describe('memory usage', () => {
  const toMB = 1024*1024;

  it('should report stats in megabytes', sinon.test(function() {
    const returnedUsage = {rss: toMB, heapTotal: 2 * toMB, heapUsed: 3 * toMB};
    const expectedUsage = {rss: 1, heapTotal: 2, heapUsed: 3};
    this.stub(process, 'memoryUsage').returns(returnedUsage);

    const mem = new MemoryUsage(process);

    expect(mem.rss()).to.equal(expectedUsage.rss);
    expect(mem.heapTotal()).to.equal(expectedUsage.heapTotal);
    expect(mem.heapUsed()).to.equal(expectedUsage.heapUsed);
  }));

  it('should report stats in megabytes from real process.memoryUsage()', () => {
    const usageBeforeMb = {
      rss: process.memoryUsage().rss / toMB,
      heapUsed: process.memoryUsage().heapUsed / toMB,
      heapTotal: process.memoryUsage().heapTotal / toMB
    };

    const mem = new MemoryUsage(process);

    expect(mem.rss()).to.be.within(usageBeforeMb.rss - 2, usageBeforeMb.rss + 2);
    expect(mem.heapTotal()).to.be.within(usageBeforeMb.heapTotal - 2, usageBeforeMb.heapTotal + 2);
    expect(mem.heapUsed()).to.be.within(usageBeforeMb.heapUsed - 2, usageBeforeMb.heapUsed + 2);
  });
});