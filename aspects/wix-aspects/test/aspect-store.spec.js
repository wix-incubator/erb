'use strict';
const expect = require('chai').expect,
  aspects = require('..');

describe('aspect store', () => {
  let expectedStore, store;

  beforeEach(() => {
    expectedStore = {
      name1: new AConcreteAspect('name1', {dataItem: 'dataItemValue'}),
      name2: new AConcreteAspect('name2', {dataItem: 'dataItemValue'})
    };

    store = aspects.buildStore({dataItem: 'dataItemValue'},
      [data => new AConcreteAspect('name1', data), data => new AConcreteAspect('name2', data)]);
  });

  it('should build aspect store from aspect builders', () => {
    expect(store).to.deep.equal(expectedStore);
  });

  it('should return a single aspect from a store', () => {
    expect(store.name1).to.deep.equal(expectedStore.name1);
  });

  it('should fail when no aspects were provided', () => {
    expect(() => aspects.buildStore({dataItem: 'dataItemValue'})).to.throw('AssertionError');
  });

  it('should fail when empty array of aspects was provided', () => {
    expect(() => aspects.buildStore({dataItem: 'dataItemValue'}, [])).to.throw('AssertionError');
  });

  it('should fail when requestData object was not provided', () => {
    expect(() => aspects.buildStore()).to.throw('AssertionError');
  });

});

class AConcreteAspect extends aspects.Aspect {
  constructor(name, data) {
    super(name, data || {});
    this._aspect = data || {name};
  }
}
