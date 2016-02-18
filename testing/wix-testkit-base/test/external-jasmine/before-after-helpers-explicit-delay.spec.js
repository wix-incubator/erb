'use strict';
const TestkitStub = require('../stubs');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 500;

describe('wix-testkit-base', () => {

  describe('beforeAndAfter with explicit delay', () => {
    const service = new TestkitStub(false, false, 1000);

    beforeAll(() => expect(service.running).toBe(false));

    service.beforeAndAfter(1200);

    it('should be started', () => expect(service.running).toBe(true));

    afterAll(() => expect(service.running).toBe(false));
  });

  describe('beforeAndAfterEach with explicit delay', () => {
    const service = new TestkitStub(false, false, 1000);

    beforeAll(() => expect(service.running).toBe(false));

    service.beforeAndAfterEach(1200);

    it('should be started #1', () => expect(service.running).toBe(true));
    it('should be started #2', () => expect(service.running).toBe(true));

    afterAll(() => {
      expect(service.running).toBe(false);
      expect(service.cycleCount).toEqual(2);
    });
  });
});