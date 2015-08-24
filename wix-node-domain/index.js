var _ = require('lodash');
var domain = require('domain');

var domainName = 'wix-domain';

exports.wixDomainMiddleware = function(){
  return function(req, res, next){
    var wixDomain = domain.create();
    wixDomain.name = domainName;
    wixDomain.req = req; /* TODO - no test - will be tested in glue npms */
    wixDomain.res = res; /* TODO - no test - will be tested in glue npms */
    wixDomain.run(function(){
      // todo extract to error listener module
      wixDomain.on('error', function AsyncErrorHandler(error) {
        return res.emit('x-error', error);
      });
      next();
    });
  };
};

exports.wixDomain = function(){
  return _.find(domain._stack, function(o){
    return o.name === domainName;
  });
};

exports.expressErrorHandlerMiddleware = function SyncErrorHandler(err, req, res, next) {
  res.emit('x-error', err);
};