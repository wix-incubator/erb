const expect = require('chai').use(require('chai-things')).expect,
  messages = require('../lib/messages');

describe('messages', () => {

  describe('workerFailed', () => {

    it('should coerce errors', () => {
      const err = messages.workerFailed(1, new Error('woops')).value.err;

      expect(err.name).to.equal('Error');
      expect(err.message).to.equal('woops');
      expect(err.stack).to.contain.an.item.that.is.string('at Context.it');
    });
  });
});