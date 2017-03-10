const TestkitStub = require('../stubs');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 500;

const service = new TestkitStub(false, false, 1000);
service.beforeAndAfter(1200);

describe('wix-testkit-base', () => {

  describe('beforeAndAfter with explicit global delay #1', () => {
    it('should be started', () => expect(service.running).toBe(true));

    afterAll(() => expect(service.cycleCount).toBe(1));
  });

  describe('beforeAndAfter with explicit global delay #2', () => {
    it('should be started', () => expect(service.running).toBe(true));

    afterAll(() => expect(service.cycleCount).toBe(1));
  });

});
