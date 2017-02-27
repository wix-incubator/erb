const SpecsCollector = require('../lib/specs-collector'),
  expect = require('chai').expect,
  _ = require('lodash'),
  {spec1, spec2} = require('./specs-fixture');

describe('SpecsCollector', () => {

  it('should return an empty object', () => {
    const collector = aCollector();
    expect(collector.specs).to.deep.equal({});
  });
  
  it('should return added specs', () => {
    const collector = aCollector();
    collector.addSpecs(spec1);
    expect(collector.specs).to.deep.equal(spec1);
  });
  
  it('should handle multiple additions', () => {
    const collector = aCollector();
    collector.addSpecs(spec1);
    collector.addSpecs(spec2);
    expect(collector.specs).to.deep.equal(Object.assign({}, spec1, spec2));
  });
  
  describe('addSpecs should validate ', () => {
    function aSpecProto() {
      return {
        scope: 'myScope',
        owner: 'shahart@wix.com',
        onlyForLoggedInUsers: true,
        allowedForBots: true,
        persistent: false,
        testGroups: ['true', 'false']
      }
    }
    
    function aSpecWithout(keyPath) {
      const spec = aSpecProto();
      _.unset(spec, keyPath);
      return spec;
    }

    function aSpec(overrides) {
      return Object.assign(aSpecProto(), overrides);
    }

    checkValidation('specs is an object', /valid.*object/)(undefined);
    
    checkValidation('spec has a scope', /.*myspec.*scope/)({'specs.myspec': aSpecWithout('scope')});
    
    checkValidation('spec has an optional persistent flag of type boolean', /.*myspec.*persistent.*boolean/)({'specs.myspec': aSpec({persistent: 666})});
    
    checkValidation('spec has an optional allowedForBots flag of type boolean', /.*myspec.*allowedForBots.*boolean/)({'specs.myspec': aSpec({allowedForBots: 666})});
    
    checkValidation('spec has not null scope', /.*myspec.*scope.*string/)({'specs.myspec': aSpec({scope: null})});
    
    checkValidation('spec scope is a string', /.*myspec.*scope.*string/)({'specs.myspec': aSpec({scope: []})});
    
    checkValidation('spec has owner', /.*myspec.*owner/)({'specs.myspec': aSpecWithout('owner')});

    checkValidation('spec owner is a string', /.*myspec.*owner.*string/)({'specs.myspec': aSpec({owner: []})});
    
    checkValidation('spec has onlyForLoggedInUsers flag', /.*myspec.*onlyForLoggedInUsers/)({'specs.myspec': aSpecWithout('onlyForLoggedInUsers')});
    
    checkValidation('spec onlyForLoggedInUsers is boolean', /.*myspec.*onlyForLoggedInUsers.*boolean/)({'specs.myspec': aSpec({onlyForLoggedInUsers: 666})});
    
    checkValidation('spec does not contain unknown properties', /.*myspec.*myprop/)({'specs.myspec': aSpec({'myprop': 666})});
    
    checkValidation('spec testGroups is an array', /.*myspec.*testGroups.*array/)({'specs.myspec': aSpec({'testGroups': 666})});
    
    checkValidation('spec testGroups is an array of strings', /.*myspec.*testGroups.*string/)({'specs.myspec': aSpec({'testGroups': ['aa', 234]})});
    
    function checkValidation(description, assertionRegex) {
      return specs => it(description, () => {
        expect(() => aCollector().addSpecs(specs)).to.throw(assertionRegex);
      });
    }
  });
  
  function aCollector() {
    return new SpecsCollector();
  }
});
