const expect = require('chai').expect,
  Factory = require('..'),
  Reporter = require('./support/reporter');

describe('wix measured factory', () => {

  it('should validate mandatory arguments for constructor', () => {
    expect(() => new Factory()).to.throw('host');
    expect(() => new Factory('')).to.throw('host');
    expect(() => new Factory({})).to.throw('host');
    expect(() => new Factory('local')).to.throw('appName');
    expect(() => new Factory('local', {})).to.throw('appName');
    expect(() => new Factory('local', 'app')).to.not.throw(Error);
  });

  it('should validate mandatory arguments for collection', () => {
    const factory = new Factory('nonlocal', 'nonapp');

    expect(() => factory.collection()).to.throw('mandatory');
    expect(() => factory.collection('name')).to.throw('mandatory');
    expect(() => factory.collection('name', 'value')).to.not.throw();
  });
  
  
  it('should create instance with common prefix', () => {
    const reporter = new Reporter();
    const factory = new Factory('nonlocal', 'nonapp');
    factory.addReporter(reporter);
    factory.collection('aName', 'aValue').meter('aMeterName', 'aMeterValue')(1);

    expect(reporter.meters('root=node_app_info.host=nonlocal.app_name=nonapp')).to.not.be.empty;
  });
});
