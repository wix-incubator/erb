'use strict';
const envSupport = require('..'),
  expect = require('chai').expect;

describe('env-support.basic', () => {

  it('should generate a basic environment object with port ranges between 3000..4000', () => {
    const env = envSupport.basic();

    expect(env.MOUNT_POINT).to.equal('/app');
    expect(env.APP_NAME).to.equal('app');
    expect(env.PORT).to.be.above(2999).and.be.below(4001);
    expect(env.MANAGEMENT_PORT).to.be.above(2999).and.be.below(4001);
  });

  it('should generate MANAGEMENT_PORT different than PORT', () => {
    const env = envSupport.basic();

    expect(env.MANAGEMENT_PORT).to.not.equal(env.PORT);
  });

  it('should merge properties of provided object into result', () => {
    const env = envSupport.basic({prop1: 'val1', APP_NAME: 'qwe'});

    expect(env.prop1).to.equal('val1');
    expect(env.APP_NAME).to.equal('qwe');
  });
});