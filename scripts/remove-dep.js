'use strict';
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json'));

[packageJson.dependencies, packageJson.devDependencies].forEach(el => {

  if (el) {
    Object.keys(el).forEach(key => {
      if (key === "wix-express-domain") {
        console.log(`found dep with *: ${key}, removing`);
        delete el[key];
      }
    });
  }

  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
});

