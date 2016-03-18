'use strict';
const chance = require('chance')(),
  assert = require('assert');

module.exports.addTo = function (to) {

  to.withPetriAnonymous = function () {
    const args = Array.prototype.slice.call(arguments);
    assert(args.length === 0 || args.length === 2, 'Expected either no args or specId and value');
    const specId = args.length === 0 ? '1' : args[0];
    const specValue = args.length === 0 ? '1' : args[1];

    let petriCookie = this.cookies['_wixAB3'] || '';
    petriCookie += `${petriCookie.length > 0 ? '|' : ''}${specId}#${specValue}`;
    this.cookies['_wixAB3'] = petriCookie;
    return this;
  };

  to.withPetri = function () {
    const args = Array.prototype.slice.call(arguments);
    assert(args.length === 0 || args.length === 1 || args.length === 3, 'Expected either no args, only userId or userId, specId and value');
    const userId = args.length > 0 ? args[0] : chance.guid();
    const specId = args.length > 1 ? args[1] : '1';
    const specValue = args.length > 1 ? args[2] : '1';
    let petriCookie = this.cookies[`_wixAB3|${userId}`] || '';
    petriCookie += `${petriCookie.length > 0 ? '|' : ''}${specId}#${specValue}`;
    this.cookies[`_wixAB3|${userId}`] = petriCookie;
    return this;
  };
};