var domain = require('wix-express-domain');

module.exports = function(){
  return new ReqContextService();
};

function reqContext(){
  // This hack is to create the context only on the first time we try
  // to read/write
  if(!domain.wixDomain().reqContext)
    domain.wixDomain().reqContext = {};
  return domain.wixDomain().reqContext;
}

function ReqContextService(){        
}


/**************************************************************
|  Request Id
\**************************************************************/
ReqContextService.prototype.reuqetId = function(){
  return reqContext()._reuqestId;
};

ReqContextService.prototype.setReuqetId = function(requestId){
  reqContext()._reuqestId = requestId;
};

/**************************************************************
 |  User Ip
 \**************************************************************/
ReqContextService.prototype.userIp = function(){
  return reqContext()._userIp;
};

ReqContextService.prototype.setUserIp = function(userIp){
  reqContext()._userIp = userIp;
};

/**************************************************************
 |  User port
 \**************************************************************/
ReqContextService.prototype.userPort = function(){
  return reqContext()._userPort;
};

ReqContextService.prototype.setUserPort = function(userPort){
  reqContext()._userPort = userPort;
};

/**************************************************************
 |  User Agent
 \**************************************************************/
ReqContextService.prototype.userAgent = function(){
  return reqContext()._userAgent;
};

ReqContextService.prototype.setUserAgent = function(userAgent){
  reqContext()._userAgent = userAgent;
};

/**************************************************************
 |  Geo data
 \**************************************************************/
ReqContextService.prototype.geoData = function(){
  return reqContext()._geoData;
};

ReqContextService.prototype.setGeoData = function(geoData){
  reqContext()._geoData = geoData;
};