'use strict';

//TODO: make sure code is safe - especially err.stack.split.
module.exports.coerce = err => {
  const ret = {
    name: err.name,
    message: err.message,
    stack: err.stack.split('\n'),
    __error__: true
  };

  return ret;
};
