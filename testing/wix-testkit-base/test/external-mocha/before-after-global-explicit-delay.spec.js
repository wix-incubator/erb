'use strict';
const TestkitStub = require('../stubs'),
  expect = require('chai').expect;

const service = new TestkitStub(false, false, 1000);
service.beforeAndAfter(1500);

describe('wix-testkit-base', function() {
  this.timeout(500);

  describe('beforeAndAfter allows to override timeout in global context #1', () => {
    it('should be started', () => expect(service.running).to.be.true);

    after(() => expect(service.cycleCount).to.equal(1));
  });

  describe('beforeAndAfter allows to override timeout in global context #2', () => {
    it('should be started', () => expect(service.running).to.be.true);

    after(() => expect(service.cycleCount).to.equal(1));
  });
});