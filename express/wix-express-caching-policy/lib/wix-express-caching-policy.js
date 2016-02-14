'use strict';


module.exports.default = () => middleware({});
module.exports.specific = age => middleware({caching: "specific", age: age});
module.exports.infinite = () => middleware({caching: "infinite"});
module.exports.noHeaders = () => middleware({caching: "noHeaders"});
module.exports.maxAge = () => middleware({caching: "maxAge"});

var middleware = strategy => (req, res, next) =>{
  req.cachingPolicy = strategy;
  next();
  
  // here we listen to event and write headers
  // need tp preserve the state, to make sure headers written only once
};

