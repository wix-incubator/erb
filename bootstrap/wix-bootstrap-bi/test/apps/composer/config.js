'use strict';
module.exports = context => {
  const bi = context.bi;
  bi.setDefaults({src: 5});

  return {biLogger: aspects => bi.logger(aspects)};
};