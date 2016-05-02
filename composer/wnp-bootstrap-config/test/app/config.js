'use strict';

module.exports = context => {
  return {
    config: context.config.load('app-config')
  };
};