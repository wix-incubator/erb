'use strict';
const TestkitStub = require('../stubs'),
  expect = require('chai').expect;

describe('wix-testkit-base', () => {

  describe('start/stop with callbacks', () => {
    const service = new TestkitStub();

    before(() => expect(service.running).to.be.false);

    before(done => service.start(done));

    it('should be started', () => expect(service.running).to.be.true);

    after(done => service.stop(done));

    after(() => expect(service.running).to.be.false);
  });

  describe('start/stop with promises', () => {
    const service = new TestkitStub();

    before(() => expect(service.running).to.be.false);

    before(() => service.start());

    it('should be started', () => expect(service.running).to.be.true);

    after(() => service.stop());

    after(() => expect(service.running).to.be.false);
  });
});