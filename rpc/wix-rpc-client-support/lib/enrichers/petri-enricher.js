'use strict';
const _ = require('lodash');

module.exports.get = (wixPetri) => {

  return (headers) => {
    _.forEach(wixPetri.get(), (value, key) =>{
      if(key.indexOf('|') === -1){
        headers['X-Wix-Petri-Anon-RPC'] = value;
      }
      else {
        var headerName = 'X-Wix-Petri-Users-RPC-' + key.split('|')[1];
        headers[headerName] = value;
      }
    });

  };
};