var cookie = require('cookie'),
    _ = require('lodash');

module.exports.toHeader = function toHeader(cookies){
  var ser = [];
  // todo change to forEach
  for(var key in cookies){
    ser.push(cookie.serialize(key, cookies[key]))
  }
  return ser.join('; ');
};

module.exports.toDomain = function toDomain(header){
  if(header)
    return cookie.parse(header);
  else
    return {};

};
