const expect = require('chai').expect,
  objects = require('../lib/objects');

describe('objects', () => {

  describe('merge', () => {

    it('should update to value from source object', () => {
      const dest = {foo: 'bar'};
      const source = {foo: 'baz'};

      expect(objects.merge(dest, source)).to.deep.equal({foo: 'baz'});
    });

    it('should not add elements with keys in source that do not exist in dest', () => {
      const dest = {foo: 'bar'};
      const source = {fuz: 'baz'};

      expect(objects.merge(dest, source)).to.deep.equal({foo: 'bar'});
    });

    it('should deep update to value from source object', () => {
      const dest = {foo: {foo: 'bar'}};
      const source = {foo: {foo: 'baz'}};

      expect(objects.merge(dest, source)).to.deep.equal({foo: {foo: 'baz'}});
    });

    it('should deep update multiple values from source object', () => {
      const dest = {foo: {foo: 'bar', another: 1}};
      const source = {foo: {foo: 'baz', another: 2}};

      expect(objects.merge(dest, source)).to.deep.equal({foo: {foo: 'baz', another: 2}});
    });

    it.skip('should merge arrays', () => {

    });
  });

  describe('rm', () => {

  });
});
