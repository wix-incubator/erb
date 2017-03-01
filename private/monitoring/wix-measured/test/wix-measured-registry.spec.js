const Registry = require('../lib/wix-measured-registry'),
  expect = require('chai').expect;

describe('wix measured registry', () => {

  it('validates presence of prefix for new instance creation', () => {
    expect(() => new Registry({})).to.throw('mandatory');
  });

  it('creates registry with provided prefix and empty metrics maps', () => {
    const registry = new Registry({prefix: 'aPrefix'});

    expect(registry.prefix).to.equal('aPrefix');
    expect(registry.meters).to.deep.equal({});
    expect(registry.gauges).to.deep.equal({});
    expect(registry.hists).to.deep.equal({});
  });

  ['Meter', 'Gauge', 'Hist'].forEach(metricType => {
    const addFunctionName = `add${metricType}`;
    const getterName = `${metricType.toLowerCase()}s`;
    
    describe(metricType, () => {
      
      it(`adds ${metricType} to a registry with existing prefix`, () => {
        const registry = new Registry({prefix: 'aPrefix'});
        registry[addFunctionName]('aName', 'aValue', 'thing');
        
        expect(registry[getterName]['aPrefix.aName=aValue']).to.equal('thing');
      });

      it(`sanitizes key, value for ${metricType}`, () => {
        const registry = new Registry({prefix: 'aPrefix'});
        
        registry[addFunctionName]('a Name', 'a Value', 'thing');

        expect(registry[getterName]['aPrefix.a_Name=a_Value']).to.equal('thing');
      });
      
      it(`validates name, value, ${metricType} arguments`, () => {
        const registry = new Registry({prefix: 'aPrefix'});
        
        expect(() => registry[addFunctionName]('aName')).to.throw('mandatory');
        expect(() => registry[addFunctionName]('aName', 'aValue')).to.throw('mandatory');
      });
    });
  });
  
  describe('forCollection', () => {
    
    it('validates key, name when creating new collection', () => {
      const registry = new Registry({prefix: 'aPrefix'});
      
      expect(() => registry.forCollection()).to.throw('mandatory');
      expect(() => registry.forCollection('key')).to.throw('mandatory');
    });

    it('sanitizes key, name when creating new collection', () => {
      const collection = new Registry({prefix: 'aPrefix'}).forCollection('a key', 'a name');
      
      expect(collection.prefix).to.equal('aPrefix.a_key=a_name');
    });
  });
});
