const TestkitStub = require('../stubs'),
  expect = require('chai').expect;

describe('wix-testkit-base', () => {

  describe('stop with callbacks fails', () => {
    const service = new TestkitStub(false, true);

    before(() => expect(service.running).to.be.false);

    before(done => service.start(done));

    it('should be started', () => expect(service.running).to.be.true);

    after(done => service.stop(done));

    after(() => expect(service.running).to.be.true);
  });

  describe('stop with promises fails', () => {
    const service = new TestkitStub(false, true);

    before(() => expect(service.running).to.be.false);

    before(() => service.start());

    it('should be started', () => expect(service.running).to.be.true);

    after(() => service.stop());

    after(() => expect(service.running).to.be.true);
  });
});
