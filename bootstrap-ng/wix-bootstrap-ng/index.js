'use strict';
const Composer = require('wnp-bootstrap-composer');

//TODO: provide proper feedback if trying to plug-in one of preset parts - runner, express, management
module.exports = opts => {
  const options = opts || {};
  options.runner = require('wnp-bootstrap-runner');
  options.composers = {
    mainExpress: () => require('wnp-bootstrap-express')(),
    managementExpress: () => require('wnp-bootstrap-management')
  };
  const composer = new Composer(options);
  composer.use(require('wnp-bootstrap-config'));
  composer.use(require('wnp-bootstrap-session'));
  
  return composer;
};