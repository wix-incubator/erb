'use strict';
exports.resolve = (headers, remoteAddress) => headers['x-wix-ip'] || headers['x-forwarded-for'] || remoteAddress;
