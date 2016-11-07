const expect = require('chai').expect,
  EventLoop = require('../../lib/meter/event-loop'),
  eventLoop = EventLoop.loop,
  tickMs = EventLoop.interval,
  lolex = require('lolex');

describe('event loop', () => {
  let stop, clock;

  beforeEach(() => clock = lolex.install());
  afterEach(() => {
    stop && stop();
    clock.uninstall();
  });

  it('should report event loop metrics in ms', done => {
    let reportedDuration = 0;
    const eventLoopSpinMs = 1;

    stop = eventLoop(ms => reportedDuration = ms);

    clock.tick(tickMs + eventLoopSpinMs);

    process.nextTick(() => {
      expect(Math.round(reportedDuration)).to.equal(eventLoopSpinMs);
      done();
    });
  });

  it('should report event loop duration periodically', done => {
    let runCount = 0;
    const ticks = 3;

    stop = eventLoop(() => runCount++);

    clock.tick(tickMs * ticks);

    process.nextTick(() => {
      expect(runCount).to.equal(ticks);
      done();
    });
  });

  it('should stop timer upon returned function invocation', done => {
    let runCount = 0;

    stop = eventLoop(() => runCount++);

    clock.tick(tickMs);
    stop();
    clock.tick(tickMs);

    process.nextTick(() => {
      expect(runCount).to.equal(1);
      done();
    });
  });
});