module.exports = (req, res, next) => {
  if (!req.secure) {
    const url = req.aspects['web-context'].url.replace(/^http:/, 'https:');
    res.redirect(301, url);
  } else {
    next();
  }
}
