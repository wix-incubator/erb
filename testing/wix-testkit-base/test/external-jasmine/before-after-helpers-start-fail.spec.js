'use strict';
const TestkitStub = require('../stubs');

describe('wix-testkit-base', () => {

  describe('beforeAndAfter start fail', () => {
    const service = new TestkitStub(true);

    beforeAll(() => expect(service.running).toBe(false));

    service.beforeAndAfter();

    it('should not be started', () => expect(service.running).toBe(false));

    afterAll(() => expect(service.running).toBe(false));
  });

  describe('beforeAndAfterEach start fail', () => {
    const service = new TestkitStub(true);

    beforeAll(() => expect(service.running).toBe(false));

    service.beforeAndAfterEach();

    it('should not be started #1', () => expect(service.running).toBe(false));
    it('should not be started #2', () => expect(service.running).toBe(false));
  });
});