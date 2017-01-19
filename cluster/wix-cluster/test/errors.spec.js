const expect = require('chai').use(require('chai-things')).expect,
  coerce = require('../lib/errors').coerce;

describe('errors', () => {

  describe('coerce', () => {

    it('should coerce error', () => {
      const err = new Error('woops');
      const coerced = coerce(err);

      expect(coerced.name).to.equal('Error');
      expect(coerced.message).to.equal('woops');
      expect(coerced.stack).to.contain.an.item.that.is.string('at Context.it');
    });

    it('should not fail for a string', () => {
      coerce('qwe');
    });

    it('should not fail for an error without stack', () => {
      const coerced = coerce({name: 'errName', message: 'aMessage'});
      expect(coerced.name).to.equal('errName');
      expect(coerced.message).to.equal('aMessage');
      expect(coerced.stack).to.be.empty;
    });
  });
});