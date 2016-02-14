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
        res.set('Pragma', 'no-cache');
        res.set('Cache-Control', 'no-cache');
        break;
      case 'specific':
        res.set('Cache-Control', 'max-age=' + req.cachingPolicy.age);
        break;
      case 'infinite':
        res.set('Cache-Control', 'max-age=2419200');
        break;
      case 'noCache':
        res.set('Pragma', 'no-cache');
        res.set('Cache-Control', 'no-cache');
        break;
    }
  });

  next();
};

