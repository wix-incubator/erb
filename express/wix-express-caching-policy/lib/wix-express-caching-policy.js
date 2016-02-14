'use strict';


module.exports.defaultStrategy = () => middleware({});
module.exports.specificAge = age => middleware({caching: 'specificAge', age: age});
module.exports.infinite = () => middleware({caching: 'infinite'});
module.exports.noHeaders = () => middleware({caching: 'noHeaders'});
module.exports.noCache = () => middleware({caching: 'noCache'});



function middleware(strategy){
  return (req, res, next) => {
    req.cachingPolicy = strategy;
    listen(req, res);
    next();
  };
}


function listen(req, res){
  res.on('x-before-flushing-headers', () => {
    switch (req.cachingPolicy.caching){
      case undefined:
        setPragmaNoCache(res);
        setCacheControlNoCache(res);
        break;
      case 'specificAge':
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
}

function setPragmaNoCache(res){
  res.set('Pragma', 'no-cache');
}

function setCacheControlSpecific  (res, age){
  res.set('Cache-Control', 'max-age=' + age);
}

function setCacheControlNoCache(res){
  res.set('Cache-Control', 'no-cache');
}

