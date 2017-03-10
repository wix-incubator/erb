const TestkitStub = require('../stubs'),
  expect = require('chai').expect;

const service = new TestkitStub(false, false, 1000);
service.beforeAndAfterEach(1500);

describe('wix-testkit-base', function() {
  this.timeout(500);

  describe('beforeAndAfter allows to override timeout in global context', () => {
    it('should be started', () => expect(service.running).to.be.true);
    it('should be started', () => expect(service.running).to.be.true);

    after(() => expect(service.cycleCount).to.equal(2));
  });

});
