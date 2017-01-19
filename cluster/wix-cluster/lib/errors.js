module.exports.coerce = err => {
  return {
    name: err.name,
    message: err.message,
    stack: safeSplit(err.stack),
    __error__: true
  };
};

function safeSplit(str) {
  try {
    return str.split('\n');
  } catch (e) {
    return [];
  }
}