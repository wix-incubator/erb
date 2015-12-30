'use strict';

module.exports.get = (wixSession) => {

  return (headers) => {
    const session = wixSession.get();
    if(session && session.token){
      headers['X-Wix-Session'] = session.token;
    }
  };
};