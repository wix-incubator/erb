# Signer
Hmac signer that return hex signature for given strings/buffers 

## Install
``` 
    npm install signer --save
```

## Usage
```javascript
    
    var Signer = require('signer');
    var key = "1234567890123456";
    var signer = Signer(key);
    
    // sign string
    var signature = signer.sign('some-string');
    
    // sign array of strings
    var signature = signer.sign(['some-string', 'some-other-string']);
    
    // sign Buffer
    var buffer = new Buffer('to-buff');
    var signature = signer.sign(buffer);
        
    // sign of array of strings
    var buffers = [new Buffer('to-buff'),new Buffer('to-buff')] ;
    var signature = signer.sign(buffers);
 

```
