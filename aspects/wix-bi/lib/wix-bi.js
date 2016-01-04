'use strict';
var wixDomain = require('wix-domain');

exports.set = biData => wixDomain.get().biData = biData;
exports.get = () => wixDomain.get().biData || {};

