var domain = require('wix-express-domain');

module.exports = function(){
  return new ReqContextService();
};

function webContext(){
  // This hack is to create the context only on the first time we try
  // to read/write
  if(!domain.wixDomain().webContext)
    domain.wixDomain().webContext = {};
  return domain.wixDomain().webContext;
}

function ReqContextService(){        
}


/**************************************************************
|  Request Id
\**************************************************************/
ReqContextService.prototype.reuqetId = function(){
  return webContext()._reuqestId;
};

ReqContextService.prototype.setReuqetId = function(requestId){
  webContext()._reuqestId = requestId;
};

/**************************************************************
 |  User Ip
 \**************************************************************/
ReqContextService.prototype.userIp = function(){
  return webContext()._userIp;
};

ReqContextService.prototype.setUserIp = function(userIp){
  webContext()._userIp = userIp;
};

/**************************************************************
 |  User port
 \**************************************************************/
ReqContextService.prototype.userPort = function(){
  return webContext()._userPort;
};

ReqContextService.prototype.setUserPort = function(userPort){
  webContext()._userPort = userPort;
};

/**************************************************************
 |  User Agent
 \**************************************************************/
ReqContextService.prototype.userAgent = function(){
  return webContext()._userAgent;
};

ReqContextService.prototype.setUserAgent = function(userAgent){
  webContext()._userAgent = userAgent;
};

/**************************************************************
 |  Geo data
 \**************************************************************/
ReqContextService.prototype.geoData = function(){
  return webContext()._geoData;
};

ReqContextService.prototype.setGeoData = function(geoData){
  webContext()._geoData = geoData;
};