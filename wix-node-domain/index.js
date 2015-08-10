var _ = require('lodash');

var domainName = 'wix-domain';

exports.wixDomainMiddleware = function(){
  return function(req, res, next){
      var domain = require('domain').create();
      domain.name = domainName;
      domain.run(function(){
         next();           
      });
  };      
};

exports.domain = function(){
    return _.find(require('domain')._stack, function(o){
        return o.name == domainName;
    }).name;
};