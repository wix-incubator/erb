# das-boot

Basic test-app proving integration of [wix-bootstrap](../wix-bootstrap) and [wix-bootstrap-testkit](../wix-bootstrap-testkit).

It uses:
 - [wix-bootstrap](../wix-bootstrap) to serve our app;
 - [wix-bootstrap-testkit](../wix-bootstrap-testkit) to run your app in tests;
 - [wix-config](../../config/wix-config) to load app config;
 - [wix-rpc-testkit](../../rpc/wix-rpc-testkit) to server fake rpc service;
 - [wnpm-ci](https://github.com/wix/wnpm/tree/master/wnpm-ci) to build/deploy in ci;
 - [wix-mocha-ci-reporter](https://github.com/wix/wnpm/tree/master/wix-mocha-ci-reporter) - to have proper test-results in ci;
 
Oh, and it runs on production: http://docker01.aus.wixpress.com:32564/das-boot/app-info/about