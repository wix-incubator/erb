var cookieParser = require('cookie-parser');

/**
 * @param app  - express app
 * @param routes - routes pattern for match the controller that will require wixSession
 * @param keys - object mainKey, alternateKey
 */
exports.init = function (app, routes, keys) {
    app.use(cookieParser());
    var wixSession = require('wix-session')(keys);
    app.use(routes, middleware(wixSession));
};

// TODO - need to support middleware for action redirect

var middleware =  function (wixSession) {
    return function (req, res, next) {
        if (!req.cookies.wixSession) {
            res.statusCode = 401;
            res.end('Banned');
        }
        else {
            var session = wixSession.fromStringToken(req.cookies.wixSession);
            if (!(session.isError)) {
                req.wixSession = session;
                next();
            } else {
                res.statusCode = 401;
                res.end('Banned');
            }
        }
    }
}