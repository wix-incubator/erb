var wixDomain = require('wix-node-domain'),
    Chance = require('chance'),
    chance = new Chance(),
    requestId = require('./lib/requestId');


exports.webContextMiddleware = function(){
  return function(req, res, next){
      var domain = wixDomain.wixDomain();
      var context = {};
      context.requestId = requestId.getOrCreateRequestId(req);
      domain.webContext = context;
      next();
  };
    
};

exports.webContext = function(){
    return wixDomain.wixDomain().webContext;
};