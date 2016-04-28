'use strict';

module.exports = context => {
  return {
    port: context.env.port,
    customKey: 'customValue'
  };
};