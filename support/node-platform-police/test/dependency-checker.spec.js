const expect = require('chai').expect;
const checker = require('../lib/dependency-checker');

const outdatedDependency = 
  {
    'wix-bootstrap-bi': {
      wanted: '0.0.1',
      latest: '0.1.528',
      location: '',
      type: 'dependencies'
    }
  };

const anotherOutdatedDependency =
  {
    'wix-bootstrap-something': {
      wanted: '0.0.2',
      latest: '1.2.0',
      location: '',
      type: 'dependencies'
    }
  };

const devDependency =
  {
    'uuid': {
      wanted: '1.0.0',
      latest: '2.0.0',
      location: '',
      type: 'devDependencies'
    }
  };

const nonBootstrapDependency =
  {
    'uuid': {
      wanted: '0.0.2',
      latest: '1.2.0',
      location: '',
      type: 'dependencies'
    }
  };


describe('dependency checker', () => {

  it('should return empty array', () => {
    expect(checker({})).to.be.deep.equal([]);
  });
  
  it('should return array of outdated dependency', () => {
    expect(checker(outdatedDependency)).to.be.deep.equal([outdatedDependency['wix-bootstrap-bi']]);
  });

  it('should return array of outdated dependencies', () => {
    expect(checker(Object.assign({}, outdatedDependency, anotherOutdatedDependency))).to.be.deep.equal([
      outdatedDependency['wix-bootstrap-bi'],
      anotherOutdatedDependency['wix-bootstrap-something']
    ]);
  });

  it('should check only production dependencies', () => {
    expect(checker(devDependency)).to.be.deep.equal([]);
  });

  it('should check only bootstrap dependencies', () => {
    expect(checker(nonBootstrapDependency)).to.be.deep.equal([]);
  });

});
