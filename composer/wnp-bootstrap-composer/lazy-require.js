//Note: can be used only from ./ as it does not resolve modules from another location properly
module.exports = (path, requireOverride = require) => {
  const handler = {
    apply: (target, that, args) => target().apply(that, args),
    get: (target, property) => target()[property],
    construct: (target, args, newTarget) => Reflect.construct(target(), args, newTarget)
  };
  return new Proxy(function () {
    return requireOverride(path)
  }, handler);
};
