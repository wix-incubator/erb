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

Add `.nvmrc` to your module root:

```
6.2.0
```


Add `build.js` file to your module root:

```js
const spawn = require('child_process').spawnSync;

const result = spawn('sh', ['-c', 'npm install && node_modules/.bin/spjs-build'], {stdio: 'inherit'});
if (result.status) {
  process.exit(result.status);
}
```

You are good to go.
