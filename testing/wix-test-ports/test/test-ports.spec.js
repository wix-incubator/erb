const testPorts = require('..'),
  expect = require('chai').expect;

describe('test-ports', () => {

  it('should be unique', () => {
    const ports = new Set();
    Object.keys(testPorts).forEach(key => ports.add(testPorts[key]));
    
    expect(Object.keys(testPorts).length).to.equal(ports.size);
  });
});
