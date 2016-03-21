'use strict';
const fs = require('fs');
const packageJson = fs.readFileSync('package.json').toString();
const updated = packageJson.replace(/\\"lint\\": \\"jshint/g, `"lint": "eslint`);

fs.writeFileSync('package.json', updated);

