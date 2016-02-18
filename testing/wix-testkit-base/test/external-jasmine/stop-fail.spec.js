'use strict';
const TestkitStub = require('../stubs');

describe('wix-testkit-base', () => {

  describe('stop fails', () => {
    const service = new TestkitStub(false, true);

    beforeAll(() => expect(service.running).toBe(false));

    beforeAll(done => service.start(done));

    it('should be started', () => expect(service.running).toBe(true));

    afterAll(done => service.stop(done));

    afterAll(() => expect(service.running).toBe(true));
  });
});