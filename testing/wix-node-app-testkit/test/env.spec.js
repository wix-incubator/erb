'use strict';
const env = require('..').env,
  chai = require('chai'),
  expect = chai.expect;

chai.use(require('chai-things'));

describe('env', () => {

  it('should generate random port within predefined port range', () => {
    const ports = [env.randomPort(), env.randomPort()];

    expect(ports).all.to.be.be.above(3000);
    expect(ports).all.to.be.be.below(4000);
    expect(ports[0]).to.not.equal(ports[1]);
  });

  it('should generate environments with ports within predefined port range', () => {
    const ports = [env.generate(), env.generate()].map(env => env.PORT);

    expect(ports).all.to.be.be.above(3000);
    expect(ports).all.to.be.be.below(4000);
    expect(ports[0]).to.not.equal(ports[1]);
  });
});