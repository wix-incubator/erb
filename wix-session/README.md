# wix-session

## install
```javascript
    npm install wix-session --save
```

## usage

in most cases you get the wix session from the [wix-session-express-middleware](../wix-session-express-middleware)

```javascript


var wixSession = require('wix-session')({mainKey: 'xxxxx', alternateKey: 'yyyyy'});

// get wixSessioon object
var session = wixSession.fromStringToken('tokens');

// get the user Guid
session.userGuid

// convert session to token
var token = wixSession.sessionToToken(session);

```

## wix session options

-- mainKey
-- alternateKey

## wix session members

- uid
- userGuid
- userName
- email
- mailStatus
- isWixStaff
- permissions
- userCreationDate
- version
- userAgent
— isRemembered
- expiration
- colors

