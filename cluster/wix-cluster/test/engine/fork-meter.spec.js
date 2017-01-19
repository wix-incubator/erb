const expect = require('chai').use(require('sinon-chai')).expect,
  ForkMeter = require('../../lib/engine/fork-meter'),
  lolex = require('lolex');

describe('fork-meter', () => {
  let clock;
  beforeEach(() => clock = lolex.install());
  afterEach(() => clock && clock.uninstall());

  it('should tell not to throttle by default', () => {
    const meter = new ForkMeter();

    expect(meter.shouldThrottle()).to.equal(false);
  });

  it('should not throttle given less that 5 forks', () => {
    const meter = new ForkMeter();

    for (let i = 0; i < 4; i++) {
      meter.mark();
    }

    clock.tick(5000);

    expect(meter.shouldThrottle()).to.equal(false);
  });

  it('should use sliding window for throttling', () => {
    const meter = new ForkMeter();

    for (let i = 0; i < 20; i++) {
      meter.mark();
    }

    clock.tick(70000);

    expect(meter.shouldThrottle()).to.equal(false);
  });

  it('should tell to throttle given more than 20 forks per minute', () => {
    const meter = new ForkMeter();

    for (let i = 0; i < 20; i++) {
      meter.mark();
    }

    clock.tick(30000);

    expect(meter.shouldThrottle()).to.equal(true);
  });

  it('should stop throttling after 1st minute', () => {
    const meter = new ForkMeter();

    for (let i = 0; i < 900; i++) {
      meter.mark();
    }

    clock.tick(60000);

    expect(meter.shouldThrottle()).to.equal(false);
  });
});