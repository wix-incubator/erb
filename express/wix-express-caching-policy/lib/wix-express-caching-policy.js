'use strict';

module.exports.withStrategy = strategy => (req,res, next) => {
  req.cachingPolicy = strategy();
  next();
};
module.exports.specific = age => _specific;
module.exports.infinite = _infinite;
module.exports.noHeaders = _noHeaders;
module.exports.maxAge = _maxAge;


var _specific = ()=> {};
var _infinite = ()=> {};
var _noHeaders = ()=> {};
var _maxAge = age => {};
