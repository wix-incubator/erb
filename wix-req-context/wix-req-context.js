var domain = require('wix-express-domain');

module.exports = function(){
  return new ReqContextService();
};

function ReqContextService(){
  if(!domain.wixDomain().webContext){
    domain.wixDomain().webContext = {};
  }

}
/**************************************************************
|  Request Id
\**************************************************************/
ReqContextService.prototype.reuqetId = function(){
  return domain.wixDomain().webContext._reuqestId;
};

ReqContextService.prototype.setReuqetId = function(requestId){
  domain.wixDomain().webContext._reuqestId = requestId;
};

/**************************************************************
 |  User Ip
 \**************************************************************/
ReqContextService.prototype.userIp = function(){
  return domain.wixDomain().webContext._userIp;
};

ReqContextService.prototype.setUserIp = function(userIp){
  domain.wixDomain().webContext._userIp = userIp;
};

/**************************************************************
 |  User port
 \**************************************************************/
ReqContextService.prototype.userPort = function(){
  return domain.wixDomain().webContext._userPort;
};

ReqContextService.prototype.setUserPort = function(userPort){
  domain.wixDomain().webContext._userPort = userPort;
};

/**************************************************************
 |  User Agent
 \**************************************************************/
ReqContextService.prototype.userAgent = function(){
  return domain.wixDomain().webContext._userAgent;
};

ReqContextService.prototype.setUserAgent = function(userAgent){
  domain.wixDomain().webContext._userAgent = userAgent;
};

/**************************************************************
 |  Geo data
 \**************************************************************/
ReqContextService.prototype.geoData = function(){
  return domain.wixDomain().webContext._geoData;
};

ReqContextService.prototype.setGeoData = function(geoData){
  domain.wixDomain().webContext._geoData = geoData;
};