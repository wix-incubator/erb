'use strict';
module.exports.resolve = (headers, url) => headers['x-wix-url'] || url;