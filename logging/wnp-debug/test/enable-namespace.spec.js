const expect = require('chai').expect,
  enableNamespace = require('../lib/enable-namespace');

describe('enable namespace', () => {
  
  it('should add DEBUG env variable with provided namespace if none set', () => {
    expect(enableNamespace(undefined, 'name:space')).to.equal('name:space');
  });

  it('append namespace to existing env variable', () => {
    expect(enableNamespace('one', 'name:space')).to.equal('one,name:space');
  });

  it('should not append namespace if it is already present', () => {
    expect(enableNamespace('one,name:space', 'name:space')).to.equal('one,name:space');
  });
});
