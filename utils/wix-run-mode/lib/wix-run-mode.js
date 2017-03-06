module.exports.isProduction = (effectiveEnv = process.env) => {
  return (effectiveEnv.NODE_ENV || '').toLowerCase() === 'production';
};
module.exports.isCI = (effectiveEnv = process.env) => {
  return !!(effectiveEnv.IS_BUILD_AGENT && (effectiveEnv.IS_BUILD_AGENT === 'true') || effectiveEnv.IS_BUILD_AGENT === true);
};
