const lazyRequire = require('../lazy-require'),
  sinon = require('sinon'),
  expect = require('chai').use(require('sinon-chai')).expect;

describe('lazy-require', () => {

  it('should require a module and call a function for default export', () => {
    const defaultExport = sinon.spy();
    const requireOverride = sinon.stub().returns(defaultExport);

    lazyRequire('./dep', requireOverride)('arg');

    expect(requireOverride).to.have.been.calledWith('./dep');
    expect(defaultExport).to.have.been.calledWith('arg')
  });

  it('should forward a call to a property to a module', () => {
    const defaultExport = {prop: sinon.spy()};
    const requireOverride = sinon.stub().returns(defaultExport);

    lazyRequire('./dep', requireOverride).prop('arg');

    expect(requireOverride).to.have.been.calledWith('./dep');
    expect(defaultExport.prop).to.have.been.calledWith('arg')
  });

  it('should call a constructor of a module', () => {
    const defaultExport = sinon.spy();
    const requireOverride = sinon.stub().returns(defaultExport);
    const Lazy = lazyRequire('./dep', requireOverride);

    new Lazy('arg');

    expect(requireOverride).to.have.been.calledWith('./dep');
    expect(defaultExport).to.have.been.calledWithNew;
  });
});
