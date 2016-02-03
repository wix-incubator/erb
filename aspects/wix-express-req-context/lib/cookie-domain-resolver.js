'use strict';
const urlParse = require('url-parse'),
  wixComDomain = '.wix.com';

module.exports.resolve = url => {
  const urlParts = urlParse(url);
  if(urlParts.host.endsWith('wix.com')){
    return wixComDomain;
  }else if (urlParts.host.indexOf('wixpress.com') > -1){
    const hostParts = urlParts.host.split('.');
    if(hostParts.length >= 3){
      return '.' + hostParts[hostParts.length - 3] + '.' + hostParts[hostParts.length - 2] + '.' + hostParts[hostParts.length - 1];
    } else {
      return wixComDomain;
    }
  } else {
    // default, need to check this
    return wixComDomain;
  }

};