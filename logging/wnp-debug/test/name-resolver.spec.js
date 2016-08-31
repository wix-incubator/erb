'use strict';
const expect = require('chai').expect,
  resolve = require('../lib/name-resolver');

describe('name-resolver', () => {

  [{from: 'wnp-module-name', to: expectedFor('wix', 'module-name')},
    {from: 'wix-module-name', to: expectedFor('wix','module-name')},
    {from: 'module-name', to: expectedFor('wix','module-name')},
    {from: 'wnp:module-name', to: expectedFor('wix','module-name')}]
    .forEach(el => {
      it(`should resolve from '${el.from}'`, () =>
        expect(resolve(el.from)).to.deep.equal(el.to)
      );
    });

  function expectedFor(prefix, suffix) {
    return {
      'debug': `${prefix}:debug:${suffix}`,
      'info': `${prefix}:info:${suffix}`,
      'error': `${prefix}:error:${suffix}`
    }
  }
});