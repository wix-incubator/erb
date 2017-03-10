const TestkitStub = require('../stubs'),
  expect = require('chai').expect;

describe('wix-testkit-base', function() {
  this.timeout(500);

  describe('beforeAndAfter allows to override timeout', () => {
    const service = new TestkitStub(false, false, 1000);

    before(() => expect(service.running).to.be.false);

    service.beforeAndAfter(1500);

    it('should be started', () => expect(service.running).to.be.true);

    after(() => expect(service.running).to.be.false);
  });

  describe('beforeAndAfterEach allows to override timeout', () => {
    const service = new TestkitStub(false, false, 1000);

    before(() => expect(service.running).to.be.false);

    service.beforeAndAfterEach(1500);

    it('should be started #1', () => expect(service.running).to.be.true);
    it('should be started #2', () => expect(service.running).to.be.true);

    after(() => {
      expect(service.running).to.be.false;
      expect(service.cycleCount).to.equal(2);
    });
  });
});
