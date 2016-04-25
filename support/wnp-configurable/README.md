# wnp-configurable

Exports a script `wnp-copy-config-templates` that copies over config templates (.erb) to the location defined by env-variable `APP_TEMPL_DIR` given script is being executed in production set-up (NODE_ENV=production).

See [usage](#usage) for intended use case and set-up.

## install

```js
npm install --save wnp-configurable
```

## usage

given you have a npm module which has a config it owns (.erb where values need to be injected in production by infra/chef) you have to:

Place your configs (ex. my-module-config.js.erb) in `./templates`, like:

```
.
├── README.md
├── pom.xml
├── package.json
└── templates
    └── my-module-config.js.erb
```

Add `wnp-copy-config-templates` as a npm `postinstall` script:

```js
{
  "name": "my-module",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "postinstall": "wnp-copy-config-templates"
  },
  "dependencies": {
    "wnp-configurable": "latest"
  }  
```

And one of following will happen:
 - configs will be copied over to `process.env.APP_TEMPL_DIR` given `process.env.NODE_ENV === 'production'`;
 - action will be skipped and message emitted to stdout given `process.env.NODE_ENV !== 'production'`;
 - script will fail given `process.env.NODE_ENV !== 'production'` and `process.env.APP_TEMPL_DIR` not set.