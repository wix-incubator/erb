'use strict';
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json'));

if (packageJson.dependencies) {
  Object.keys(packageJson).forEach(key => {
    if (packageJson[key] === "*") {
      console.log(`found dep with *: ${key}, replacing with latest`);
      packageJson[key] = 'latest'
    }
  });
}

if (packageJson.devDependencies) {
  Object.keys(packageJson).forEach(key => {
    if (packageJson[key] === "*") {
      console.log(`found dep with *: ${key}, replacing with latest`);
      packageJson[key] = 'latest'
    }
  });
}

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));