const jwt = require('jsonwebtoken'),
  assert = require('assert');

const algo = 'RS256';

exports.encrypt = (data, opts) => {
  assert(opts, 'options.privateKey is mandatory');
  assert(opts.privateKey, 'options.privateKey is mandatory');
  return jwt.sign(data, opts.privateKey, {algorithm: algo});
};

exports.decrypt = (data, opts) => {
  assert(opts, 'options.publicKey is mandatory');
  assert(opts.publicKey, 'options.publicKey is mandatory');
  return jwt.verify(data, opts.publicKey, {
    algorithms: [algo],
    ignoreExpiration: opts.ignoreExpiration || false
  });
};

exports.decode = data => jwt.decode(data);
