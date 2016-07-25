# spjs-build

builder for modules within `server-platform-js` repo with features:
 - runs tests on multiple hardcoded/predefined node versions;

# install

```bash
npm install -g spjs-build
```

# usage

Add `build.js` file to your module root:

```js
require('spjs-build')();
```