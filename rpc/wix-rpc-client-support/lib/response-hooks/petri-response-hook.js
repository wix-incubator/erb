'use strict';

const cookieUtils = require('cookie-utils');

module.exports.get = petriContext => {
  return (headers) => {
    if(headers['set-cookie']){
      let petriCookies = {};
      let shouldRewritePetri = false;
      headers['set-cookie'].forEach(cookie => {
        const cookies = cookieUtils.fromHeader(cookie);
        for(var cookieName in cookies){
          if(cookieName.startsWith('_wixAB3')){
            shouldRewritePetri = true;
            petriCookies[cookieName] = cookies[cookieName];
          }
        }
      });

      if(shouldRewritePetri){
        petriContext.set({cookies: petriCookies});
      }
    }

  };
};