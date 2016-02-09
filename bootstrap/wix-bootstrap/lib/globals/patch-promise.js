'use strict';
module.exports.setup = promise => {
  global.Promise = promise;
};
