'use strict';
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json'));

[packageJson.dependencies, packageJson.devDependencies].forEach(el => {

  if (el) {
    Object.keys(el).forEach(key => {
      if (el[key] === "*") {
        console.log(`found dep with *: ${key}, replacing with latest`);
        el[key] = 'latest'
      }
    });
  }

  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
});

