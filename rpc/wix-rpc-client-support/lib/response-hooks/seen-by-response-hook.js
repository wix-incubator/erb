'use strict';
const option = require('option');

module.exports.get = wixRequestContext => {
  return (headers) => {
    /*const biContext = wixRequestContext.get();
    option.fromNullable(biContext.globalSessionId)
      .map((header) => {
        headers['X-Wix-Client-Global-Session-Id'] = header;
      });

    option.fromNullable(biContext.cidx)
      .map((header) => {
        headers['X-Wix-Clien-Id'] = header;
      });

    return headers;*/
    console.log('kfir on response')
    console.log(wixRequestContext.get())
    console.log(headers);
    console.log('kfir111111')
  };
};