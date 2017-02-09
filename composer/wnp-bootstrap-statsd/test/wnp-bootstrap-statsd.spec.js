const expect = require('chai').use(require('sinon-chai')).expect,
  bootstrapStatsD = require('..'),
  MeasuredStatsD = require('wix-measured-statsd-adapter'),
  sinon = require('sinon'),
  Logger = require('wnp-debug').Logger,
  WixMeasuredFactory = require('wix-measured');

describe('wnp-bootstrap-statsd', () => {

  it('should add itself onto provided measured factory', () => {
    const {statsd, measuredFactory} = adapterWithMocks();

    statsd();

    expect(measuredFactory.addReporter).to.have.been.calledWithMatch(sinon.match.instanceOf(MeasuredStatsD));
  });

  it('should register a shutdown hook', () => {
    const {statsd, shutdownAssembler} = adapterWithMocks();

    statsd();

    expect(shutdownAssembler.addFunction).to.have.been.calledWithMatch('statsd', sinon.match.any);
  });

  it('should return statsd configuration', () => {
    const {statsd} = adapterWithMocks();

    const statsdConfiguration = statsd({'WIX_BOOT_STATSD_HOST': 'local', 'WIX_BOOT_STATSD_INTERVAL': 12});

    expect(statsdConfiguration).to.deep.equal({host: 'local', interval: 12});
  });

  function adapterWithMocks() {
    const shutdownAssembler = { addFunction: sinon.spy()};
    const log = sinon.createStubInstance(Logger);
    const measuredFactory = sinon.createStubInstance(WixMeasuredFactory);
    const statsd = (env = {}) => bootstrapStatsD({env, log, measuredFactory, shutdownAssembler});

    return {log, statsd, measuredFactory, shutdownAssembler,};
  }

});
