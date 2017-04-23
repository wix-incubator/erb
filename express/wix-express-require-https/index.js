const {isEnabled} = require('./lib/is-enabled');

module.exports = (req, res, next) => {
  if (isEnabled() && !req.secure) {
    const url = req.aspects['web-context'].url.replace(/^http:/, 'https:');
    res.redirect(301, url);
  } else {
    next();
  }
};
