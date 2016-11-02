'use strict';
const WixMeasured = require('./lib/wix-measured'),
  tagsToPrefix = require('./lib/tags').tagsToPrefix;

module.exports = class WixMeasuredWrapper extends WixMeasured {
  constructor(tags) {
    super({prefix: tagsToPrefix(tags || {})});
  }
}