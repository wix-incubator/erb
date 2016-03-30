# wnp-rolling-file

Write to a file based on wix log file conventions:
 - naming;
 - day-based rolling by default;

## install

```js 
npm install --save wnp-rolling-file
```

## usage

```js
const roller = require('wnp-rolling-file');

const file = roller('./logs', {
  prefix: 'wix.general'
});

// will create a log file './logs/wix.general.2016-10-12-000000.0.log'

file.write('foo');//writes without waiting for result;

file.write('bar', (err, data) => console.log(data));//calls back after actual write.
```

# Api

## (logDir, opts) : FileWriter
Creates a new file-backed writer which you can use to write data to.

Parameters:
 - logDir - string, name of folder to create files in;
 - opts: options with:
  - prefix - mandatory, string - log file prefix, where log file will be created 'PREFIX.YYYY-MM-DD-HHMMSS.N.log'.

## FileWriter.write(content [, callback])
Write content to the rolling file stream, optionally proving a callback function that will be called when the content has been written.