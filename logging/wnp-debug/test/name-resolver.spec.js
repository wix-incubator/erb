'use strict';
const expect = require('chai').expect,
  resolve = require('../lib/name-resolver');

describe('name-resolver', () => {

  [{from: 'wnp-module-name', to: 'wnp:module-name'},
    {from: 'wix-module-name', to: 'wix:module-name'},
    {from: 'module-name', to: 'wnp:module-name'},
    {from: 'wnp:module-name', to: 'wnp:module-name'}]
    .forEach(el => {
      it(`should resolve '${el.to}' from '${el.from}'`, () =>
        expect(resolve(el.from)).to.equal(el.to)
      );
    });
});