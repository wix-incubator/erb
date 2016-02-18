'use strict';
const TestkitStub = require('../stubs'),
  expect = require('chai').expect;

describe('wix-testkit-base', () => {

  describe('beforeAndAfter', () => {
    const service = new TestkitStub();

    before(() => expect(service.running).to.be.false);

    service.beforeAndAfter();

    it('should be started', () => expect(service.running).to.be.true);

    after(() => expect(service.running).to.be.false);
  });

  describe('beforeAndAfterEach', () => {
    const service = new TestkitStub();

    before(() => expect(service.running).to.be.false);

    service.beforeAndAfterEach();

    it('should be started #1', () => expect(service.running).to.be.true);
    it('should be started #2', () => expect(service.running).to.be.true);

    after(() => {
      expect(service.running).to.be.false;
      expect(service.cycleCount).to.equal(2);
    });
  });
});