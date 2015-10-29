# wix-erb

Compiles a given ERB template using a given JSON data.
This general module is particularly useful for testing `/templates`,
which, on production deployment, are normally compiled by the wix deployment system.

## install

```bash
npm install --save-dev wix-erb
```

## usage

Executing

```javascript
var erb = require('wix-erb');

var data = {
  "values": {
    "additions": "with pattie, breaded and fried"
  },
  "functions": {
    "title": [
      [
        1,
        "One Chicken Fried Steak"
      ],
      [
        2,
        3,
        "Two or Three Chicken Fried Steaks"
      ]
    ]
  }
}

erb({
  timeout: 1000,
  data: data,
  template: 'Morty had <%= title(1) %> <%= additions %>.\nRick had <%= title(2, 3) %> <%= additions %>.'
}).then(console.log, console.error);
```

would result in

```
Morty had One Chicken Fried Steak with pattie, breaded and fried.
Rick had Two or Three Chicken Fried Steaks with pattie, breaded and fried.
```

## API

### `erb(opts)`

`opts` is a simple JSON object with these properties:

* `timeout` (optional, integer) - number of milliseconds (defaults to 1000) to wait for the template evaluation to finish before terminating with error
* `data` (optional, object) - an object that contains these properties:
  * `values` (optional, object) - the keys of this object are variable names to be used in the ERB template and values are the values of the variables
  * `functions` (optional, object) - the keys of this object are function names to be used in the ERB template and values are special arrays - the items match the function call arguments with the last item being the value returned by the function when called with these arguments.
* `template` (required, string) - the ERB template to be compiled

## build

Requires [Bundler](http://bundler.io/).

```bash
npm run build
```