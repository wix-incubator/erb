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
         next();           
      });
  };      
};

exports.wixDomain = function(){
  return _.find(domain._stack, function(o){
        return o.name === domainName;
    });
};