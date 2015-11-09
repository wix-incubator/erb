'use strict';
const log4js = require('log4js'),
  _ = require('lodash');

module.exports.get = (category) => {
  return new WixLogger(category);
};

class WixLogger {
  constructor(category) {
    this.logger = log4js.getLogger(category);
  }

  info() {
    this.logger.info(arguments);
  }

  error() {
    if (arguments.length === 2) {
      let args = Array.prototype.slice.call(arguments);
      if (_.isString(args[0]) && _.isError(args[1])) {
        let error = args[1];
        error.message = `${args[0]} [${error.toString()}]`;
        this.logger.error(error);
      } else {
        this.logger.error(arguments);
      }
    } else {
      this.logger.error(arguments);
    }
  }
}