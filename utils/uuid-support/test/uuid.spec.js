const uuidGenerator = require('..'),
  chai = require('chai'),
  expect = chai.expect,
  matchers = require('./matchers');

chai.use(matchers);

describe('uuid', () => {
  it('should generate uuid', () => {
    expect(uuidGenerator.generate()).to.be.validGuid();
  });
});
