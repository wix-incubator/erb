var wixDomain = require('wix-express-domain'),
    requestId = require('./lib/requestId');


exports.reqContextMiddleware = function(){
  return function(req, res, next){
      var domain = wixDomain.wixDomain();
      var context = {};
      context.requestId = requestId.getOrCreateRequestId(req);
      // TODO - Extract more parametets and save to context
      domain.reqContext = context;
      next();
  };
    
};

//TODO: should this really be exposed? then what wix-req-context is for?
exports.reqContext = function(){
    return wixDomain.wixDomain().reqContext;
};
