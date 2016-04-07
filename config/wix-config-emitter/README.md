# wix-config-emitter

Given config .erb templates and function/value declarations to apply, renders resulting configs.

Imitates what chef does in wix production.

## install

```js
npm install --save wix-config-emitter
```

## usage

Given you have config template (`my-app.json.erb`) in './templates':

```js
{
  "metasite": "<%= service_url("com.wixpress.wix-meta-site-manager-webapp") %>" 
}
```

and executing code:

```js
const emitter = require('wix-config-emitter');

emitter()
  .fn('service_url', 'com.wixpress.wix-meta-site-manager-webapp', 'http://localhost:8080')
  .emit();
```

Will render resulting config in `./test/configs`:

```js
{
  "metasite": "http://localhost:8080"
}
```

For functions/values to be used please see [Wix Artifact Config Templates](https://kb.wixpress.com/pages/viewpage.action?title=Wix+Artifact+Config+Templates&spaceKey=chef).

## Api

### (opts): WixConfigEmitter
Create new instance of `WixConfigEmitter` with provided options.

Parameters:
 - opts - object, optional;
  - sourceFolders - array of string, mandatory - list of folders to load '*.erb' templates from;
  - targetFolder - string, mandatory - folder to write rendered configs to. Will create folder if it does not exist.

Given `opts` is not provided, it infers defaults:

```js
{
  sourceFolders: ['./templates'],
  targetFolder: './test/configs'
}
```

### WixConfigEmitter.fn(fnName, fnArgs..., value): WixConfigEmitter
Declare an '.erb' function with arguments and resulting value to be applied against config template.

Parameters:
 - fnName - string, mandatory - name of function to apply, ex. 'databag_passwd', 'service_url';
 - fnArgs - varargs of string, mandatory - function arguments to match for application;
 - value - primitive, mandatory - value to replace function to.
 
Note that there can be multiple function applications with different arguments:
 
```js
require('wix-config-emitter')()
  .fn('service_url', 'artifact1', 'value1')
  .fn('service_url', 'artifact2', 'value2')
  .emit();
```

### WixConfigEmitter.val(varName, value): WixConfigEmitter
Declare an '.erb' variable and resulting value to be applied against config template.

Parameters:
 - varName - string, mandatory - name of variable to substitute;
 - value - primitive, mandatory - value to replace function to.

Note that there can be only one variable declaration and last one declared takes precedence:
 
```js
require('wix-config-emitter')()
  .val('base_domain', 'localhost')
  .emit();
```

### WixConfigEmitter.emit(): Promise
Render configs and return a Promise.