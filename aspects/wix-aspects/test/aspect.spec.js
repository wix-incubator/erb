'use strict';
const expect = require('chai').expect,
  Aspect = require('..').Aspect;

describe('aspect class', () => {
  
  it('should fail if name is not provided', () => {
    expect(() => new Aspect()).to.throw('AssertionError');
  });

  it('should fail if data is not provided', () => {
    expect(() => new Aspect('name')).to.throw('AssertionError');
  });

  it('should expose name, raw data accessors', () => {
    const aspect = new ConcreteAspect();
    expect(aspect.name).to.equal('cAspect');
  });

  it('should provide jsonified version same as raw()', () => {
    const aspect = new ConcreteAspect();
    expect(JSON.parse(JSON.stringify(aspect))).to.deep.equal({'key': 'value'});
  });

  it('should return empty object by default from export', () => {
    expect(new Aspect('name', {}).export()).to.deep.equal({});
  });

  it('should be noop by default for import', () => {
    new Aspect('name', {}).import();
  });

  it('should provide raw object for JSON.stringify', () => {
    expect(JSON.parse(JSON.stringify(new ConcreteAspect()))).to.deep.equal({'key': 'value'});
  });
});

class ConcreteAspect extends Aspect {
  constructor() {
    super('cAspect', {});
    this._aspect = {'key': 'value'};
  }

  get key() {
    return this._aspect.key;
  }
}

