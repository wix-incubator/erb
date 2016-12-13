'use strict';
module.exports.resolve = (headers, url) => headers['x-wix-forwarded-url'] || url;