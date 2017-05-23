const reporterFactory = require('../lib/reporter'),
  expect = require('chai').use(require('sinon-chai')).expect,
  sinon = require('sinon'),
  Logger = require('wnp-debug').Logger;

describe('report()', () => {

  const log = sinon.createStubInstance(Logger); 
  
  it('logs error upon misconfiguration - missing middleware', () => {
    const reporter = reporterFactory(null, null, log);
    return reporter({} /* req */, {} /* res */)
      .then(() => expect(log.error).to.have.been.calledWithMatch(/.*page.*view.*misconfiguration.*/));
  });
});
