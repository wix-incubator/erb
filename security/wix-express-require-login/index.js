const {HttpStatus, ErrorCode, wixSystemError} = require('wix-errors'),
  _ = require('lodash');

module.exports = class WixExpressRequireLogin {

  constructor(urlResolver, validation) {
    this._urlResolver = urlResolver;
    this._validation = validation;
  }

  forbid() {
    return (req, res, next) => {
      if (WixExpressRequireLogin._hasSession(req)) {
        this._validate(req, res, next)
      } else {
        next(new SessionRequiredError());
      }
    }
  }

  redirect(url) {
    return (req, res, next) => {
      if (WixExpressRequireLogin._hasSession(req)) {
        this._validate(req, res, next)
      } else {
        this._makeRedirect(url, req, res);
      }
    }
  }

  _makeRedirect(url, req, res) {
    let calculated;
    if (_.isString(url)) {
      calculated = url;
    } else if (_.isFunction(url)) {
      calculated = url(req);
    } else {
      calculated = this._urlResolver(req);
    }
    res.redirect(calculated);
  }

  _validate(req, res, next) {
    if (this._validation) {
      this._validation(req, res).then(() => next()).catch(next);
    } else {
      next();
    }
  }

  static _hasSession(req) {
    return req.aspects && req.aspects['session'] && req.aspects['session'].userGuid;
  }
};

class SessionRequiredError extends wixSystemError(ErrorCode.SESSION_REQUIRED, HttpStatus.UNAUTHORIZED) {

  constructor() {
    super('Session required');
  }
}
