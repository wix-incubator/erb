# node migration

Basic rules:
  - wix provides tagged node docker images whereas given you use 'stable' tag, node versions are migrated for you once or just before they enter LTS phase;
  - wix provides fallback versioned docker images where if you have issues moving to node version within 'stable' you can use a fallback;
  - during node version mirgation 'server-platform-js' supports 2 node versions - last stable (ex. 4) and new stable (ex. 6) for at least 1 month after new stable enters LTS phase.

Flow:
 - once plan for migration to new node version is set, `server-platform-js` builds are moved to support of current latest and next latest via whatever means are deemed necessary. Currently it's running all tests on current stable and next stable;
 - switch is announced and executed - tag 'stable' is moved to new node version.
 - 1..n months after new stable enters LTS support for old stable is removed and server-platform-js can use all new features of new node version that are backwards incompatible with old stable.
