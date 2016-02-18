'use strict';

const artifactName = require(process.cwd() + '/package.json').name;

module.exports.resolve = () => artifactName;