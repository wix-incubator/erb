'use strict';

module.exports.get = wixRequestContext => {
  return (headers) => {
    if(headers['x-seen-by'] && headers['x-seen-by'].length > 0){
      if(wixRequestContext.get().seenBy){
        wixRequestContext.get().seenBy = wixRequestContext.get().seenBy.concat(headers['x-seen-by'][0].split(','));
      }
    }
  };
};