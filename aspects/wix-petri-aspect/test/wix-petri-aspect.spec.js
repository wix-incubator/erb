'use strict';
const expect = require('chai').expect,
  build = require('..').builder();

describe('wix petri aspect', () => {

  const requestData = {
    url: 'http://localhost/',
    cookies: {
      '_wixAB3': '1#1',
      '_wixAB3|123': '2#2',
      'some-other': 'and-another'
    }
  };

  describe('build', () => {

    it('should not fail for empty request data', () => {
      expect(build({url: 'http://localhost/'}).cookies).to.deep.equal({});
    });

    it('should build aspect from request data with cookies', () => {
      const aspect = build(requestData);

      expect(aspect.name).to.equal('petri');
      expect(aspect.cookies).to.deep.equal({
        '_wixAB3': '1#1',
        '_wixAB3|123': '2#2'
      });
    });

    it('should not allow to modify cookies', () => {
      const aspect = build(requestData);
      expect(() => aspect.cookies._wixAB3 = '1#0').to.throw('Cannot assign to read only property \'_wixAB3\'');
    });

  });

  describe('export', () => {

    it('should export cookies', () => {
      expect(build(requestData).export('response')).to.deep.equal({
        cookies: [
          {key: '_wixAB3', value: '1#1', properties: {maxAge: 15552000000, domain: '.wix.com', encode: String}},
          {key: '_wixAB3|123', value: '2#2', properties: {maxAge: 15552000000, domain: '.wix.com', encode: String}}]
      });
    });

  });

  describe('import', () => {

    it('should be safe to import empty object', () => {
      const aspect = build(requestData);
      aspect.import({});
      expect(aspect.cookies).to.deep.equal({
        '_wixAB3': '1#1',
        '_wixAB3|123': '2#2'
      });
    });

    it('should replace existing cookies during import', () => {
      const aspect = build(requestData);
      aspect.import({cookies: {'_wixAB3': '2#2'}});
      expect(aspect.cookies).to.deep.equal({
        '_wixAB3': '2#2',
        '_wixAB3|123': '2#2'
      });
    });

    it('should append cookies during an import', () => {
      const aspect = build(requestData);
      aspect.import({cookies: {'_wixAB3|456': '2#2'}});
      expect(aspect.cookies).to.deep.equal({
        '_wixAB3': '1#1',
        '_wixAB3|123': '2#2',
        '_wixAB3|456': '2#2'
      });
    });

    it('should not allow to modify cookies after import', () => {
      const aspect = build(requestData);
      aspect.import({cookies: {'_wixAB3': '2#2'}});
      expect(() => aspect.cookies._wixAB3 = '1#0').to.throw('Cannot assign to read only property \'_wixAB3\'');
    });
  });
});