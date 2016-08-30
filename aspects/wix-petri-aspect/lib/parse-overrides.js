'use strict';

module.exports = function (expToParse, separators) {
  if (!expToParse) {
    return {};
  }

  return expToParse.split(separators.pair).reduce((result, paramString) => {
    const paramParts = paramString.split(separators.keyValue);
    const key = paramParts[0] && paramParts[0].trim();
    const value = paramParts[1] && paramParts[1].trim();
    if (paramParts.length === 2 && key !== '' && value !== '') {
      result[key] = value;
    }
    return result;
  }, {});
};
