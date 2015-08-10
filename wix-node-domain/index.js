var _ = require('lodash');

var domainName = 'wix-domain';

exports.wixDomainMiddleware = function(){
  return function(req, res, next){
      var domain = require('domain').create();
      domain.name = domainName;
      domain.req = req; /* TODO - no test - will be tested in glue npms */
      domain.res = res; /* TODO - no test - will be tested in glue npms */
      domain.run(function(){
         next();           
      });
  };      
};

exports.wixDomain = function(){
    return _.find(require('domain')._stack, function(o){
        return o.name === domainName;
    }).name;
};