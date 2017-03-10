const TestkitStub = require('../stubs');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 500;

const service = new TestkitStub(false, false, 1000);
service.beforeAndAfterEach(1200);

describe('wix-testkit-base', () => {

  describe('beforeAndAfterEach with explicit global delay #1', () => {
    it('should be started #1', () => expect(service.running).toBe(true));
    it('should be started #2', () => expect(service.running).toBe(true));

    afterAll(() => expect(service.cycleCount).toBe(2));
  });
});
