'use strict';
const fs = require('fs');
const packageJson = fs.readFileSync('package.json').toString();
const updated = packageJson.replace(/jshint/g, 'eslint');

fs.writeFileSync('package.json', updated);

