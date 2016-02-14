# wix-run-mode

## install

```js
npm install --save wix-run-mode
```

## usage

```sh
node --debug-brk 3321 index.js
```

**index.js**

```js
console.log(require('wix-run-mode').isDebug())
```

will print 'true'.

## Api

### isDebug()
If process is running in debug mode.

### isProduction()
if app/process is running in production.

### isCI()
if app/process is running in ci.