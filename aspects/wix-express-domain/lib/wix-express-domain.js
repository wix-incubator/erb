'use strict';
const wixDomain = require('wix-domain');

module.exports = (req, res, next) => wixDomain.get().run(next);