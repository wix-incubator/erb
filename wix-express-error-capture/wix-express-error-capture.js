
var wixDomain = require("wix-node-domain");

exports.asyncErrorMiddleware = function AsyncErrorMiddlware(req, res, next){
  wixDomain.wixDomain().on('error', function AsyncErrorHandler(error) {
    return res.emit('x-error', error);
  });
  next();
};

exports.syncErrorMiddleware = function SyncErrorMiddleware(err, req, res, next) {
  res.emit('x-error', err);
};