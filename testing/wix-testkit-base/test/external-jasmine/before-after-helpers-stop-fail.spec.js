'use strict';
const TestkitStub = require('../stubs');

describe('wix-testkit-base', () => {

  describe('beforeAndAfter stop fail', () => {
    const service = new TestkitStub(false, true);

    beforeAll(() => expect(service.running).toBe(false));

    service.beforeAndAfter();

    it('should be started', () => expect(service.running).toBe(true));
  });

  describe('beforeAndAfterEach stop fail', () => {
    const service = new TestkitStub(false, true);

    beforeAll(() => expect(service.running).toBe(false));

    service.beforeAndAfterEach();

    it('should be started #1', () => expect(service.running).toBe(true));
    it('should be started #2', () => expect(service.running).toBe(true));
  });
});