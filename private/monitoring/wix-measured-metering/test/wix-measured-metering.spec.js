const expect = require('chai').use(require('sinon-chai')).expect,
  WixMeasuredMetering = require('..'),
  Promise = require('bluebird'),
  sinon = require('sinon');

describe('WixMeasuredMetering', () => {
  
  describe('raw', () => {
    
    it('reportDuration expects duration as non-negative number', () => {
      const {metering} = mockedMeasuredWithMetering();
      expect(() => metering.raw('key', 'value').reportDuration(undefined)).to.throw(/duration.*number/);
      expect(() => metering.raw('key', 'value').reportDuration('bla')).to.throw(/duration.*number/);
      expect(() => metering.raw('key', 'value').reportDuration(-22)).to.throw(/duration.*number/);
    });
    
    it('reportDuration accepts zero', () => {
      const {metering} = mockedMeasuredWithMetering();
      metering.raw('key', 'value').reportDuration(0);
    });
    
    it('reportError expects err parameter', () => {
      const {metering} = mockedMeasuredWithMetering();
      expect(() => metering.raw('key', 'value').reportError(undefined)).to.throw(/error/);
    });
  });

  describe('promise', () => {

    it('should return original result on successful execution', () => {
      const {metering} = mockedMeasuredWithMetering();
      const healthTest = healthTestWith({result: 'ok'});

      return metering
        .promise('function', 'ok')(healthTest)()
        .then(res => expect(res).to.equal('ok'));
    });


    it('should report hist and meter with provided key/value on successful execution', () => {
      const {histFn, meterFn, metering, measured, setNow} = mockedMeasuredWithMetering();
      const healthTest = healthTestWith({result: 'ok', setNewNowWithinHealthTest: () => setNow(10000)});

      return metering
        .promise('function', 'ok')(healthTest)()
        .then(() => {
          expect(measured.hist).to.have.been.calledWith('function', 'ok');
          expect(histFn).to.have.been.calledWith(10000);

          expect(measured.meter).to.have.been.calledWith('function', 'ok');
          expect(meterFn).to.have.been.calledWith(1);
        });
    });

    it('should report execution durations per test execution', () => {
      const {histFn, metering, setNow} = mockedMeasuredWithMetering();
      const durations = [10, 500];
      const healthTest = healthTestWith({result: 'ok', setNewNowWithinHealthTest: () => setNow(durations.shift())});

      const meter = metering.promise('function', 'ok')(healthTest);

      return Promise.resolve().then(meter).then(meter)
        .then(() => {
          expect(histFn.firstCall).to.have.been.calledWith(10);
          expect(histFn.secondCall).to.have.been.calledWith(490);
        });
    });
  });

  function mockedMeasuredWithMetering() {
    let now = 0;
    const setNow = newNow => now = newNow;
    const nowFn = () => now;
    const histFn = sinon.spy();
    const meterFn = sinon.spy();
    const collectionFn = sinon.spy();
    const measured = {
      hist: sinon.stub().returns(histFn),
      meter: sinon.stub().returns(meterFn),
      collection: sinon.stub().returns(collectionFn)
    };
    const metering = new WixMeasuredMetering(measured, nowFn);

    return {measured, histFn, meterFn, collectionFn, metering, setNow};
  }

  function healthTestWith({result = 'ok', setNewNowWithinHealthTest = () => 0}) {
    return () => Promise.resolve().then(() => {
      setNewNowWithinHealthTest();
      return result;
    });
  }

});
