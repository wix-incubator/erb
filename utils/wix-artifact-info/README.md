# wix-artifact-info

Reads artifact data (version, name, namespace) from metadata files present within wix'y artifact:
 - pom.xml - name, namespace;
 - ver - file produced by ci - version.

## install

```bash
npm install --save wix-artifact-info
```

## usage

Given you are in `cwd` of wix'y module:

```js
const artifactInfo = require('wix-artifact-info');

const {name, namespace, version} = artifactInfo(process.cwd());
```

## Api

### (cwd): {name, namespace, version}

Input:
 - cwd - current working directory;

Returns:
 - object with:
  - name - artifact name;
  - namespace - artifact version (package);
  - version - artifact version.
