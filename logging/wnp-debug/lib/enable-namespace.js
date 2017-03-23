module.exports = (debugEnv, namespace) => {
  if (!debugEnv) {
    return namespace;
  } else if (debugEnv.indexOf(namespace) < 0) {
    return `${debugEnv},${namespace}`;
  } else {
    return debugEnv;
  }
};
