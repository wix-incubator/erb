var _ = require('lodash');
var crypto = require('crypto');

/**
 * *
 * @param key
 * @returns {SignerService}
 */
module.exports = function service(key){
  return new SignerService(key)
};

function SignerService(key){
  this.key = key;  
}

/**
 * *
 * @param buffers buffer/array of buffer || string/array of strings
 * @returns {*}
 */
SignerService.prototype.sign = function(buffers){
  return _sign(buffers, this.key);
};



function _sign(buffers, key) {

  var bufferedKey = new Buffer(key, "utf8");
  var hmac = crypto.createHmac('sha1', bufferedKey);

  toArray(buffers).forEach(function (buffs) {
    hmac.update(buffs);
  });
  return hmac.digest('hex');
}

function toArray(buffers) {
  return _.isArray(buffers) ? buffers : [buffers];
}