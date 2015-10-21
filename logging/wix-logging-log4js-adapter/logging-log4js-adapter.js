'use strict';
const write = require('wix-logging-client').write,
  util = require('util');

exports.setup = (log4js) => {
  log4js.clearAppenders();
  log4js.addAppender(appender);
};

function appender(event) {
  if (event.data.length > 0 && event.data[0] instanceof Error) {
    write(buildEvent(event, 'error', event.data[0]));
  } else {
    write(buildEvent(event, 'msg', util.format.apply(util, event.data)));
  }
}

function buildEvent(event, key, value) {
  let partialEvent = {
    timestamp: event.startTime.getTime(),
    level: resolveLevel(event.level.levelStr),
    category: (event.categoryName === '[default]') ? 'default' : event.categoryName
  };

  partialEvent[key] = value;
  return partialEvent;
}


const levelMappings = {
  TRACE: 'debug',
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'error'
};

function resolveLevel(log4jsLevelStr) {
  return (levelMappings[log4jsLevelStr] || 'info').toLowerCase();
}
