'use strict';
const composerTestkit = require('wnp-bootstrap-composer-testkit'),
  runMode = require('wix-run-mode');

module.exports.server = server;
module.exports.app = app;
module.exports.fn = composerTestkit.fn;

function app(appFile, opts) {
  process.env['WIX-BOOT-DISABLE-MODULES'] = 'runner';
  return composerTestkit.app(appFile, opts);
}

function server(appFile, opts) {
  if (opts && opts.disableDebug && opts.disableDebug === true) {
    delete process.env['WIX-BOOT-DISABLE-MODULES'];
    return composerTestkit.server(appFile, opts);
  }
  else if (runMode.isDebug()) {
    console.log(`********************************************************`);
    console.log(`* WARNING: app is running in debug mode - node cluster *`);
    console.log(`* is not running, so behavior might differ. To disable *`);
    console.log(`* debug mode pass disableDebug option to runner.        *`);
    console.log(`********************************************************`);
    return app(appFile, opts);
  } else {
    delete process.env['WIX-BOOT-DISABLE-MODULES'];
    return composerTestkit.server(appFile, opts);
  }
}