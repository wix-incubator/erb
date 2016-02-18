'use strict';
const TestkitStub = require('../stubs');

describe('wix-testkit-base', () => {

  describe('start fails', () => {
    const service = new TestkitStub(true);

    beforeAll(() => expect(service.running).toBe(false));

    beforeAll(done => service.start(done));

    it('should be started', () => expect(service.running).toBe(false));
  });
});