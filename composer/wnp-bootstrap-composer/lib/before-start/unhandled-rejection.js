const util = require('util');

module.exports = (process, log) => {
  const intsance = handler(log);
  process.on('unhandledRejection', intsance);
  return () => process.removeListener('unhandledRejection', intsance);
};

function handler(log) {
  return (reason, p) => {
    log.error('Unhandled Rejection at: Promise %s with %s', util.inspect(p), reason);
  }
}
