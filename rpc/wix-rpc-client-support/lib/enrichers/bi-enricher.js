'use strict';
const option = require('option');

module.exports.get = wixBiContext => {
  return (headers) => {
    const biContext = wixBiContext.get();
    option.fromNullable(biContext.globalSessionId)
      .map((header) => {
        headers['X-Wix-Client-Global-Session-Id'] = header;
      });

    option.fromNullable(biContext.cidx)
      .map((header) => {
        headers['X-Wix-Clien-Id'] = header;
      });

    return headers;
  };
};