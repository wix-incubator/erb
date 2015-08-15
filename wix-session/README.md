# wix-session

## install
```javascript
    npm install wix-session --save
```

## usage
```javascript


var wixSession = require('wix-session')({mainKey: 'xxxxx', alternateKey: 'yyyyy'});

// get wixSessioon object
var session = wixSession.fromStringToken('tokens');

session.userGuid // user Guid

// convert session to token
var token = wixSession.sessionToToken(session);

```
