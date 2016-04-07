# wix-bootstrap-bi

An adapter module that gives you an instance of bi logger withing `wix-bootstrap` app.

It returns you a pre-configured, file-backed instance of [wix-bi-logger-client](../../bi/wix-bi-logger-client).

## install

```bash
npm i -S wix-bootstrap-bi
```

## usage

```js
const biLoggerFactory = require('wix-bootstrap-bi')({
  env: {
    logDir: process.env.LOG_DIR,
  },
  app: {
    artifactName: 'process.env.APP_NAME'
  }
});

module.exports = app => {

  app.get('/', (req, res, next) => {
    const bi = biLoggerFactory.logger(req.aspects);
    
    bi.log({evtId: 5})
      .then(() => res.send('woop'))
      .catch(next);  
  });  
};
```

# Api

## (opts)
Creates a new instance [wix-bi-logger-client](../../bi/wix-bi-logger-client) matching `logDir` or returns an existing one. 

Parameters:
 - opts: object, mandatory with keys:
  - env:
    - logDir: directory to log to.
  - app:
    - artifactName: name of the artifact;