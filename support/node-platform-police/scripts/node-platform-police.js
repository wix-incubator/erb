#!/usr/bin/env node
var execSync = require('child_process').execSync,
  dependencyChecker = require('../lib/dependency-checker'),
  fs = require('fs');

function execCommandWithOutput(cmd) {
  return execSync(cmd);
}

function fileExists(name) {
  try {
    fs.statSync(name);
    return true;
  } catch (e) {
    return false;
  }
}

if (!fileExists('node-platform-police.ignore')) {
  console.log('node-platform-police checking dependencies');
  var output = JSON.parse(execCommandWithOutput('npm --registry=http://repo.dev.wix/artifactory/api/npm/npm-repos outdated --json --long'));
  var outdated = dependencyChecker(output);
  outdated.forEach(dep => {
    console.error(`Found outdated bootstrap dependency ${dep.name}:${dep.wanted} -> latest version is ${dep.latest}`);
  });
  
  if (outdated.length > 0) {
    console.error('Please update versions for listed dependencies - either set to semver-latest or tag latest.');
    process.exit(1);
  }
}
