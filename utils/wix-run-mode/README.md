# wix-run-mode

## install

```bash
npm install --save wix-run-mode
```

## usage

```bash
NODE_ENV='production' node index
```

**index.js**

```js
console.log(require('wix-run-mode').isProduction())
```

will print 'true'.

## Api

### isProduction(env = process.env)
if app/process is running in production.

### isCI(env = process.env)
if app/process is running in ci.