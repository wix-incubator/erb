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
    this.logger.info.apply(this.logger, arguments);
  }

  debug() {
    this.logger.debug.apply(this.logger, arguments);
  }


  error() {
    let args = Array.prototype.slice.call(arguments);
    if (arguments.length === 2 && _.isString(args[0]) && _.isError(args[1])) {
      let error = args[1];
      error.message = `${args[0]} [${error.toString()}]`;
      this.logger.error(error);
    } else {
      this.logger.error.apply(this.logger, arguments);
    }
  }
}