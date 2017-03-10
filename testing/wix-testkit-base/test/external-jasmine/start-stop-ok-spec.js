const TestkitStub = require('../stubs');

describe('wix-testkit-base', () => {

  describe('start/stop with callbacks', () => {
    const service = new TestkitStub();

    beforeAll(() => expect(service.running).toBe(false));

    beforeAll(done => service.start(done));

    it('should be started', () => expect(service.running).toBe(true));

    afterAll(done => service.stop(done));

    afterAll(() => expect(service.running).toBe(false));
  });

  describe('start/stop with promises', () => {
    const service = new TestkitStub();

    beforeAll(() => expect(service.running).toBe(false));

    beforeAll(done => service.start().then(done));

    it('should be started', () => expect(service.running).toBe(true));

    afterAll(done => service.stop().then(done));

    afterAll(() => expect(service.running).toBe(false));
  });

});
