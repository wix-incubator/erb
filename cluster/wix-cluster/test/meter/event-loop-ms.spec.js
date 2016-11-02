const expect = require('chai').expect,
  eventLoop = require('../../lib/meter/event-loop-ms'),
  lolex = require('lolex');

describe('event-loop', () => {
  const tickMs = 1000;
  let stop, clock;

  beforeEach(() => clock = lolex.install());
  afterEach(() => {
    stop && stop();
    clock.uninstall();
  });

  it('should report event loop metrics in ms', done => {
    let reportedDuration = 0;
    const eventLoopSpinMs = 1;

    stop = eventLoop(ms => reportedDuration = ms, tickMs);

    clock.tick(tickMs + eventLoopSpinMs);

    process.nextTick(() => {
      expect(Math.round(reportedDuration)).to.equal(eventLoopSpinMs);
      done();
    });
  });

  it('should report event loop duration periodically', done => {
    let runCount = 0;
    const ticks = 3;

    stop = eventLoop(() => runCount++, tickMs);

    clock.tick(tickMs * ticks);

    process.nextTick(() => {
      expect(runCount).to.equal(ticks);
      done();
    });
  });

  it('should stop timer upon returned function invocation', done => {
    let runCount = 0;

    stop = eventLoop(() => runCount++, tickMs);

    clock.tick(tickMs);
    stop();
    clock.tick(tickMs);

    process.nextTick(() => {
      expect(runCount).to.equal(1);
      done();
    });
  });
});