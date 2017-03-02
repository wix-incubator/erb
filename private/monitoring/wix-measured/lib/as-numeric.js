module.exports = numericOrUndefined;

function numericOrUndefined(maybeNumeric) {
  const val = parseFloat(maybeNumeric);
  return isNumeric(val) ? val : undefined;
}

function isNumeric(n) {
  return !isNaN(n) && isFinite(n);
}
