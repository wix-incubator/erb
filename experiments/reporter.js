'use strict';
const fs = require('fs');

const pjs = JSON.parse(fs.readFileSync('package.json'));

if (pjs.scripts && pjs.scripts.test && pjs.scripts.test.indexOf("--reporter wix-mocha-ci-reporter") > -1) {
  console.log('ok, found "test" with mocha/reporter: ' + pjs.scripts.test + ' skipping....');
  return;
}

if (pjs.scripts && pjs.scripts.test && pjs.scripts.test.indexOf("mocha") === -1) {
  console.log('no scripts with mocha, skipping...');
  return;
} else {
  console.log('Adding mocha + reporter');

  const devDeps = pjs.devDependencies || {};
  devDeps['wix-mocha-ci-reporter'] = "*";
  pjs.devDependencies = devDeps;

  pjs.scripts.test = pjs.scripts.test + ' --reporter wix-mocha-ci-reporter';

  fs.writeFileSync('package.json', JSON.stringify(pjs, null, 2));
}

//console.log(pjs);

