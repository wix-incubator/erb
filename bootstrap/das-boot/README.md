# das-boot

Basic test-app proving integration of wix-bootstrap and wix-bootstrap-testkit.

It uses:
 - wix-bootstrap to serve our app;
 - wix-bootstrap-testkit to run your app in tests;
 - env-support to generate environment just like in prod;
 - wix-config to load app config;
 - wix-rpc-testkit to server fake rpc service;
 - wnpm-ci to build/deploy in ci;
 - wix-mocha-ci-reporter - to have proper test-results in ci;

TODO:
 - add proper config gen;
 - add proper logging support;
 - add enriched environment support;