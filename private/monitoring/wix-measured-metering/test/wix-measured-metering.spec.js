const expect = require('chai').expect,
  WixMeasuredMetering = require('..'),
  WixMeasuredFactory = require('wix-measured'),
  Promise = require('bluebird'),
  {wixBusinessError, ErrorCode} = require('wix-errors');

describe('wix-measured-metering', () => {

  it('should report hist, meter metrics on success execution and return original response', () => {
    const {reporter, measuredClient} = measuredClientWithReporter();
    const metering = new WixMeasuredMetering(measuredClient);
    const response = 'ok';

    const meteredFn = metering.promise('function', 'ok')(() => Promise.resolve(response).delay(20));

    return meteredFn().then(res => {
      const reportedHist = reporter.hists('function=ok').toJSON();
      const reportedMeter = reporter.meters('function=ok').toJSON();

      expect(res).to.equal(response);

      expect(reportedMeter.count).to.equal(1);

      expect(reportedHist.count).to.equal(1);
      expect(reportedHist.median).to.be.within(15, 30);
    });
  });

  it('should report error rate on failed execution and return original error for non-wix-errors error', done => {
    const {reporter, measuredClient} = measuredClientWithReporter();
    const metering = new WixMeasuredMetering(measuredClient);
    const returnedError = new Error('woop');

    const meteredFn = metering.promise('function', 'ok')(() => Promise.reject(returnedError));

    meteredFn().catch(e => {
      const reporterMeter = reporter.meters(`function=ok.error=Error.code=${ErrorCode.UNKNOWN}`).toJSON();
      
      expect(e).to.equal(returnedError);
      expect(reporterMeter.count).to.equal(1);

      done();
    });
  });

  it('should infer error code for errors created via wix-errors', done => {     
    const {reporter, measuredClient} = measuredClientWithReporter();
    const metering = new WixMeasuredMetering(measuredClient);
    const returnedError = new MyBusinessError('woop');

    const meteredFn = metering.promise('function', 'ok')(() => Promise.reject(returnedError));

    meteredFn().catch(e => {
      const reporterMeter = reporter.meters('function=ok.error=MyBusinessError.code=-150').toJSON();

      expect(e).to.equal(returnedError);
      expect(reporterMeter.count).to.equal(1);

      done();
    });
  });
  
  
  it('should be safe to report error as string', done => {
    const {reporter, measuredClient} = measuredClientWithReporter();
    const metering = new WixMeasuredMetering(measuredClient);
    const returnedError = 'an error';

    const meteredFn = metering.promise('function', 'ok')(() => Promise.reject(returnedError));

    meteredFn().catch(e => {
      const reporterMeter = reporter.meters('function=ok.error=an_error').toJSON();

      expect(e).to.equal(returnedError);
      expect(reporterMeter.count).to.equal(1);

      done();
    });
  });

  it('should be safe to report error as object', done => {
    const {reporter, measuredClient} = measuredClientWithReporter();
    const metering = new WixMeasuredMetering(measuredClient);
    const returnedError = {someKey: 'someValye'};

    const meteredFn = metering.promise('function', 'ok')(() => Promise.reject(returnedError));

    meteredFn().catch(e => {
      const reporterMeter = reporter.meters('function=ok.error=no-name').toJSON();

      expect(e).to.equal(returnedError);
      expect(reporterMeter.count).to.equal(1);

      done();
    });
  });

  it('should be safe to report error as undefined', done => {
    const {reporter, measuredClient} = measuredClientWithReporter();
    const metering = new WixMeasuredMetering(measuredClient);

    const meteredFn = metering.promise('function', 'ok')(() => Promise.reject());

    meteredFn().catch(e => {
      const reporterMeter = reporter.meters('function=ok.error=no-name').toJSON();

      expect(e).to.be.undefined;
      expect(reporterMeter.count).to.equal(1);

      done();
    });
  });


  it('should validate presence of measuredClient', () => {
    expect(() => new WixMeasuredMetering()).to.throw('is mandatory');
  });
  
  function measuredClientWithReporter() {
    const measuredFactory = new WixMeasuredFactory('appName', 'localhost');
    const reporter = new FilteringReporter();
    measuredFactory.addReporter(reporter);
    const measuredClient = measuredFactory.collection('aName', 'aValue');

    return {reporter, measuredClient};
  }

  class FilteringReporter {
    addTo(measured) {
      this._measured = measured;
    }

    meters(key) {
      return this._findKeyIn(this._measured.meters, key);
    }

    hists(key) {
      return this._findKeyIn(this._measured.hists, key);
    }

    _findKeyIn(where, keyPart) {
      const matchedKey = Object.keys(where).find(el => el.indexOf(keyPart) > -1);
      if (matchedKey) {
        return where[matchedKey];
      }
    }
  }
});

class MyBusinessError extends wixBusinessError(-150) {
  constructor(msg, cause) {
    super(msg, cause);
  }  
}
