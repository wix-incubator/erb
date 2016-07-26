# spjs-build

builder for modules within `server-platform-js` repo with features:
 - runs tests on multiple hardcoded/predefined node versions;

# install

```bash
npm install -g spjs-build
```

# usage

Add `spjs-build` to your `devDependencies`:

```bash
npm install --save-dev spjs-build
```

Add `.nvmrc` to your module roo:

```
6.2.0
```


Add `build.js` file to your module root:

```js
['npm install', 'spjs-build'].forEach(cmd => {
  const result = require('child_process').spawnSync('sh', ['-c', cmd], {stdio: 'inherit'});
  if (result.status) {
    process.exit(result.status);
  }
});
```

You are good to go.