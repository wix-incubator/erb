'use strict';
const fs = require('fs');
const packageJson = fs.readFileSync('package.json').toString();
const updated = packageJson.replace(/wix-mocha-ci-reporter/g, 'mocha-env-reporter');

fs.writeFileSync('package.json', updated);

