# eslint-config-spjs

Shared .eslintrc configs to be used across 'server-platform-js'.

## install

```js
npm install --save-dev eslint-config-spjs
```

## usage

Create a `.eslintrc` file in root of your module with content:

```js
{
    "extends": "eslint-config-spjs"
}
```

Within your test folder (`./test`, './it') create a `.eslintrc` file in root of your module with content:

```js
{
    "extends": "eslint-config-spjs/mocha"
}
```
