const TestkitStub = require('../stubs');

describe('wix-testkit-base', () => {

  describe('beforeAndAfter', () => {
    const service = new TestkitStub();

    beforeAll(() => expect(service.running).toBe(false));

    service.beforeAndAfter();

    it('should be started', () => expect(service.running).toBe(true));

    afterAll(() => expect(service.running).toBe(false));
  });

  describe('beforeAndAfterEach', () => {
    const service = new TestkitStub();

    beforeAll(() => expect(service.running).toBe(false));

    service.beforeAndAfterEach();

    it('should be started #1', () => expect(service.running).toBe(true));
    it('should be started #2', () => expect(service.running).toBe(true));

    afterAll(() => {
      expect(service.running).toBe(false);
      expect(service.cycleCount).toEqual(2);
    });
  });
});
