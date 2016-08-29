# wnp-bootstrap-runner

Clustered runner that uses [wix-cluster](../../cluster/wix-cluster) and is pluggable into [wnp-bootstrap-composer](../wnp-bootstrap-composer).


# Install

```bash
npm install --save wnp-bootstrap-runner
```

# Usage

Module can be used as a standalone, but it's primary intention is to be plugged into [wnp-bootstrap-composer](../wnp-bootstrap-composer).

```js
const composer = require('wnp-bootstrap-composer'),
  runner = require('wnp-bootstrap-runner');

//given this is not executed with --debug or --debug-brk, will run app in a clustered mode.
composer({runner: runner()}).start();
```

# Api

## (opts)
Returns a function that upon invocation will execute provided `thenable` function.

Parameters:
 - opts - object, pass-through to a [wix-cluster](../../cluster/wix-cluster) `run` function as a second argument.