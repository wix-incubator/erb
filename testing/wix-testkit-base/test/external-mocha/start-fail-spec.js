const TestkitStub = require('../stubs'),
  expect = require('chai').expect;

describe('wix-testkit-base', () => {

  describe('start with callbacks fails', () => {
    const service = new TestkitStub(true);

    before(() => expect(service.running).to.be.false);

    before(done => service.start(done));

    it('should not be started', () => expect(service.running).to.be.false);
  });

  describe('start with promises fails', () => {
    const service = new TestkitStub(true);

    before(() => expect(service.running).to.be.false);

    before(() => service.start());

    it('should not be started', () => expect(service.running).to.be.false);
  });
});
