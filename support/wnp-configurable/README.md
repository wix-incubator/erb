# wnp-configurable

Exports a script `wnp-copy-config-templates` or function that copies over config templates (.erb) to the location defined by env-variable `APP_TEMPL_DIR` given script is being executed in production set-up (NODE_ENV=production).

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

Invoke `wnp-configurable` during postinstall phase.

```js
{
  "name": "my-module",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "postinstall": "node -e \"require('wnp-configurable')();\"",
  },
  "dependencies": {
    "wnp-configurable": "latest"
  }  
```

** Note: ** module exports script that you can use `"postinstall": "wnp-copy-config-templates",`, but I observed for it to be fragile between npm versions and multi-versioned builds, whereas `node -e` works more reliably.

And one of following will happen:
 - configs will be copied over to `process.env.APP_TEMPL_DIR` given `process.env.NODE_ENV === 'production'`;
 - action will be skipped and message emitted to stdout given `process.env.NODE_ENV !== 'production'`;
 - script will fail given `process.env.NODE_ENV !== 'production'` and `process.env.APP_TEMPL_DIR` not set.