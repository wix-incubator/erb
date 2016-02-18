'use strict';
const TestkitStub = require('../stubs'),
  expect = require('chai').expect;

describe('wix-testkit-base', () => {

  describe('beforeAndAfter start fail', () => {
    const service = new TestkitStub(true);

    before(() => expect(service.running).to.be.false);

    service.beforeAndAfter();

    it('should be started', () => expect(service.running).to.be.false);

    after(() => expect(service.running).to.be.false);
  });

  describe('beforeAndAfterEach start fail', () => {
    const service = new TestkitStub(true);

    before(() => expect(service.running).to.be.false);

    service.beforeAndAfterEach();

    it('should not be started #1', () => expect(service.running).to.be.false);
    it('should not be started #2', () => expect(service.running).to.be.false);
  });
});