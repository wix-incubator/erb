'use strict';
const chance = require('chance')();

module.exports.addTo = function(to) {
  to.withBi = function () {
    this.cookies['_wixUIDX'] = chance.guid();
    this.cookies['_wixCIDX'] = chance.guid();
    this.cookies['_wix_browser_sess'] = chance.guid();
    this.cookies['userType'] = chance.guid();
    return this;
  };
};