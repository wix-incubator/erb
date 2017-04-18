const cookie = require('cookie'),
  decipher = require('./lib/decipher'),
  {DecryptError, UnauthorizedError} = require('./lib/errors');

const WIX_BO_COOKIE_KEY = 'WixBoAuthentication_1_19_0';

module.exports = ({baseBoUrl, buildRedirectUrl, boEncryptionKey, updateRequest}) => {
  return {
    redirect: (req, res, next) =>
      handleAuthentication(boEncryptionKey, req, updateRequest)(next, () => res.redirect(302, wixBoLoginUrl(baseBoUrl, buildRedirectUrl(req)))),
    authenticate: (req, res, next) =>
      handleAuthentication(boEncryptionKey, req, updateRequest)(next, () => next(new UnauthorizedError()))
  }
};

function defaultUpdateRequest(req, boAuth) {
  req.wix = Object.assign(req.wix || {}, {boAuth});
}

function validateAuthentication(encryptionKey, req, updateRequest = defaultUpdateRequest) {
  const wixBoToken = cookie.parse(req.headers.cookie || '')[WIX_BO_COOKIE_KEY];
  const wixBoAuth = wixBoToken ? decipher(wixBoToken, encryptionKey) : null;

  updateRequest(req, wixBoAuth);

  return !!wixBoAuth;
}

function handleAuthentication(encryptionKey, req, updateRequest) {
  try {
    return validateAuthentication(encryptionKey, req, updateRequest) ? next => next() : (next, onUnauthorized) => onUnauthorized();
  } catch (error) {
    return next => next(new DecryptError(error));
  }
}

function wixBoLoginUrl(wixBoUrl, appUrl) {
  return `${wixBoUrl.replace(/\/$/, '')}/login/?url=${encodeURI(appUrl)}`;
}
