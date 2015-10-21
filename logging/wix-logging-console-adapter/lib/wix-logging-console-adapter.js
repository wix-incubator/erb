'use strict';
const write = require('wix-logging-client').write,
  util = require('util');

exports.setup = () => {
  ['log', 'info', 'warn', 'error'].forEach(fn =>
    console[fn] = function () {
      let args = Array.prototype.slice.call(arguments);

      if (args.length > 0 && args[0] instanceof Error) {
        write(buildEvent(fn, 'error', args[0]));
      } else {
        write(buildEvent(fn, 'msg', util.format.apply(util, arguments)));
      }
    }
  );
};

function buildEvent(level, key, value) {
  let partialEvent = {
    timestamp: new Date().getTime(),
    level: (level === 'log') ? 'info' : level,
    category: 'console'
  };

  partialEvent[key] = value;
  return partialEvent;
}