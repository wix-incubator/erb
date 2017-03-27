#!/usr/bin/env node
const {writeFileSync} = require('fs'),
  {join} = require('path'),
  {execSync} = require('child_process');

const {API_KEY, REPO_API_URL, PUBLISH_REGISTRY, NPMRC_CONFIG} = config();

try {
  cleanEnvironmentFromNodeSh();
  cleanNpmCache();
  prepareAll();
  buildAll();
  testAll();
} catch (e) {
  console.error(e);
  throw e;
}

// when you run through 'npm run ...' npm sets alot of env variables and those interfere with inner npm commands
function cleanEnvironmentFromNodeSh() {
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('npm_config_')) {
      delete process.env[key];
    }
  });
}

function cleanNpmCache() {
  withLog(`Cleaning npm cache`, () => execSync('npm cache clear'));  
}

function prepareAll() {
  withLog(`preparing: version freeze, add .npmrc to all modules, override publish config`, () => {
    execSync('octo run-script -ap 16 ./scripts/pullreq-prepare.js', {
      env: Object.assign({NPMRC_CONFIG, PUBLISH_REGISTRY}, process.env)
    });
    execSync('octo modules sync --save --strict');
  });
}

function buildAll() {
  withLog(`install, build, publish all`, () => {
    execSync('octo run-script -ap 16 ./scripts/pullreq-build.js', {stdio: 'inherit'});
  });
}

function testAll() {
  withLog(`test all`, () => {
    execSync('octo run -a test', {stdio: 'inherit'});
  });
}

function withLog(msg, fn) {
  console.log(`${msg}...`);
  fn();
  console.log(`${msg} - done.`);
}

function config() {
    const PUBLISH_REGISTRY = 'https://repo.dev.wixpress.com/artifactory/api/npm/npm-node-platform-local';
    const NPMRC_CONFIG = `registry=https://repo.dev.wixpress.com/artifactory/api/npm/npm-node-platform
_auth = dmlsaXVzQHdpeC5jb206QVAyOHVSZ1poaE5Za1JNdnhhVkNOUUV1SnVV
email = vilius@wix.com
always-auth = false
`;
    const API_KEY = 'AKCp2VpZSj1tFvTKMHTyTKN9o34aNUPPuA5yjRZTqBZHowRxZ4TGXUb9YkHPjJwJciyUSLCF6';
    const REPO_API_URL = 'https://repo.dev.wixpress.com/artifactory/npm-node-platform-local';

    return {API_KEY, REPO_API_URL, PUBLISH_REGISTRY, NPMRC_CONFIG};
}