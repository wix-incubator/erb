const cookieUtils = require('cookie-utils');

module.exports.get = () => (headers, context) => {
  const ctx = context || {};
  const responseData = {
    headers: headers,
    cookies: extractCookies(headers)
  };

  Object.keys(ctx).forEach(key => {
    if (typeof ctx[key].import === 'function') {
      ctx[key].import(responseData);
    }
  });
};

function extractCookies(headers) {
  return ([headers['set-cookie']] || [])
    .reduce((prev, curr) => prev.concat(curr), [])
    .map(cookie => cookieUtils.fromHeader(cookie))
    .reduce((prev, curr) => Object.assign(prev, curr), {});
}
