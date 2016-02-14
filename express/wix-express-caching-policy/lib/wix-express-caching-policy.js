'use strict';


module.exports.defaultStrategy = () => middleware({});
module.exports.specific = age => middleware({caching: 'specific', age: age});
module.exports.infinite = () => middleware({caching: 'infinite'});
module.exports.noHeaders = () => middleware({caching: 'noHeaders'});
module.exports.noCache = () => middleware({caching: 'noCache'});

var middleware = strategy => (req, res, next) =>{
  req.cachingPolicy = strategy;


  res.on('x-before-flushing-headers', () => {
    switch (req.cachingPolicy.caching){
      case undefined:
        setPragmaNoCache(res);
        setCacheControlNoCache(res);
        break;
      case 'specific':
        setCacheControlSpecific(res, req.cachingPolicy.age);
        break;
      case 'infinite':
        setCacheControlSpecific(res, 2419200);
        break;
      case 'noCache':
        setPragmaNoCache(res);
        setCacheControlNoCache(res);
        break;
    }
  });

  var setPragmaNoCache = res => {
    res.set('Pragma', 'no-cache');
  };

  var setCacheControlSpecific = (res, age) => {
    res.set('Cache-Control', 'max-age=' + age);
  };

  var setCacheControlNoCache = res =>{
    res.set('Cache-Control', 'no-cache');
  };

  next();
};

