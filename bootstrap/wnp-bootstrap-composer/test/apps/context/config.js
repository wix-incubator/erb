'use strict';

module.exports = context => {
  return {
    env: context.env,
    app: context.app,
    newrelic: context.newrelic
  };
};