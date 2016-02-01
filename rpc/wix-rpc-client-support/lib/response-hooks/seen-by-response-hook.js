'use strict';

module.exports.get = wixRequestContext => {
  return (headers) => {
    if(headers['x-seen-by'] && headers['x-seen-by'].length > 0){
      wixRequestContext.get().seenBy = wixRequestContext.get().seenBy + ',' + headers['x-seen-by'][0];
    }
  };
};