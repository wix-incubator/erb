'use strict';
module.exports = (process, log) => {
  const instance = handler(log);
  process.on('uncaughtException', instance);
  return () => process.removeListener('uncaughtException', instance);
};

function handler(log) {
  return e => log.error('UncaughtException', e);
}