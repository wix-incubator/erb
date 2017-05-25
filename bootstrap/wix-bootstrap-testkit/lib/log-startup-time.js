const log = require('wnp-debug')('wix-bootstrap-testkit');

module.exports = promise => {
  const before = Date.now();
  return promise.then(res => {
    log.info(`App started in ${Date.now() - before} ms`);
    return res;
  })
};
