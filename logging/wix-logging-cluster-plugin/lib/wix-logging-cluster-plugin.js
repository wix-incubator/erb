'use strict';
const _ = require('lodash'),
  exchange = require('wix-cluster-exchange'),
  format = require('date-format');

const levels = ['debug', 'info', 'warn', 'error'];

module.exports = function() {
  return new Logger();
};

function Logger() {
  const server = exchange.server('wix-logging');

  this.onMaster = (cluster, next) => {
    server.onMessage(evt => {
      let stream = (_.contains(['debug', 'info'], evt.level)) ? process.stdout : process.stderr;
      validate(evt, write(stream));
    });
    next();
  };
}

const validators = [
  event => (!_.isNumber(event.timestamp)) ? 'timestamp is mandatory and must be a number' : undefined,
  event => (_.isEmpty(event.category)) ? 'category is mandatory' : undefined,
  event => (_.isEmpty(event.level) || !_.contains(levels, event.level)) ? `level is mandatory and must be one of [${levels.join(', ')}]` : undefined,
  event => (!event.msg && !event.error) ? 'either error or msg must be provided' : undefined,
  event => (event.error && !_.isObject(event.error)) ? 'error must be an object' : undefined
];

function validate(event, next) {
  let errors = _.compact(_.map(validators, validator => validator(event)));

  if (!_.isEmpty(errors)) {
    process.stderr.write(`Logging event: ${JSON.stringify(event)} rejected with reason(s): '${errors.join(', ')}'\n`);
  } else {
    next(event);
  }
}

function write(stream, evt) {
  return evt => {
    stream.write(`${format.asString('hh:mm:ss.SSS', new Date(evt.timestamp))} ${evt.level.toUpperCase()} category=[${evt.category}] ${evt.msg}\n`);
  };
}

