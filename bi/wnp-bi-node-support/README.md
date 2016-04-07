# wnp-bi-node-support

A module that augments a `wix-bi-logger-client` factory to adapt to:
 - reading metadata from aspect store;
 - writing bi events as json to a file;

** Note: ** each factory creates separate log files, so it's wise you make it a singleton in your app.

## install

```bash
npm i -S wnp-bi-node-support
```

## usage

```js
const biLogger = require('wix-bi-logger-client'),
  biNodeSupport = require('wnp-bi-node-support'),
  express = require('express');    

const biLoggerFactory = biNodeSupport.addTo(biLogger.factory(), {
    logDir: '/logs',
    filePrefix: 'wix.bi',
    artifactName: 'an-artifact'
    });
biLoggerFactory.setDefaults({srcId: 5});

const app = express(); 

//add all needed aspect middlewares, etc.

app.get('/', (req, res, next) => {
  const bi = biLoggerFactory.logger(req.aspects);
  bi.log({evtId: 1})
    .then(() => res.end())
    .catch(next);
});
```

# Api

## addTo(factory, opts)
Attaches an file-based adapter with support for aspects. Adapter produces a valid and bi-consumable log messages.

Parameters:
 - bi factory as created via `require('wix-bi-logger-client').factory()`;
 - opts: object, mandatory with keys:
  - logDir: directory to log to.
  - artifactName: name of the artifact;
  - version: version of the artifact;
  - date: function that returns a js Date instance representing now.