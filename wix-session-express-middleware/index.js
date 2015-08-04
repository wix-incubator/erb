var cookieParser = require('cookie-parser');


module.exports = function (app, wixSession) {
    app.use(cookieParser());

    return {
        process: function () {
            return function (req, res, next) {
                if (!req.cookies.wixSession) {
                    res.statusCode = 401;
                    res.end('Banned');
                }
                else {
                    var session = wixSession.fromStringToken(req.cookies.wixSession);
                    if (!(session instanceof Error)) {
                        req.wixSession = session;
                        next();
                    } else {
                        res.statusCode = 401;
                        res.end('Banned');
                    }
                }
            }
        }

    }


}