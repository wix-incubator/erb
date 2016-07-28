# node migration

## Basic rules
  - wix provides tagged node docker images whereas given you use 'stable' tag, node versions are migrated for you once or just before they enter LTS phase;
  - wix provides fallback versioned docker images where if you have issues moving to node version within 'stable' you can use a fallback;
  - during node version mirgation 'server-platform-js' supports 2 node versions - last stable (ex. 4) and new stable (ex. 6) for at least 1 month after new stable enters LTS phase.

## Flow
 - once plan for migration to new node version is set, `server-platform-js` builds are moved to support of current latest and next latest via whatever means are deemed necessary. Currently it's running all tests on current stable and next stable;
 - several candidate services 
 - switch is announced and executed - tag 'stable' is moved to new node version.
 - 1..n months after new stable enters LTS support for old stable is removed and server-platform-js can use all new features of new node version that are backwards incompatible with old stable.
 - once new node candidate is released, 'latest' docker tag is moved to that version;

fallbacks:
 - client project that cannot run on new stable version can fallback last stable node version in production and fix issues until server-platform-js is source-compatibe with old stable (2..n months);

# Log

## node@4 -> node@6

This is a big one, as npm version changed from npm@2 to npm@3.

1. Jul 27, 2016 - full server-platform-js testing for node@4 and node@6 setup on ci;
2. Jul 27, 2016 - default build target moved from node@4 to node@6;
3. Jul 28, 2016 - plan for migration announced to all;
4. Aug 03, 2016 - 'docker-repo.wixpress.com/wix-bootstrap-onbuild:stable' is moved to node@6.2.0;
5. Dec 01, 2016 - support for node@4 in server-platform-js is removed.
 
