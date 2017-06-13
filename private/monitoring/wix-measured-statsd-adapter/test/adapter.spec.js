const StatsD = require('node-statsd'),
  expect = require('chai').expect,
  WixStatsdAdapter = require('..');

describe('wix-measured-statsd-adapter', () => {

  const createAdapter = (interval) => new WixStatsdAdapter(new StatsD({host: 'localhost'}), {interval});

  describe('validates the initialization input', () => {

    it('the value of the interval to be a positive number', () => {
      const error = 'interval must be a valid';
      expect(() => createAdapter('test')).to.throw(error);
      expect(() => createAdapter({})).to.throw(error);
      expect(() => createAdapter(0)).to.throw(error);
      expect(() => createAdapter(-1)).to.throw(error);
    });

    it('the statsd client', () => {
      const error = 'statsd is mandatory';
      expect(() => new WixStatsdAdapter(10)).to.throw(error);
      expect(() => new WixStatsdAdapter({})).to.throw(error);
      expect(() => new WixStatsdAdapter()).to.throw(error);
    });
  });
});
