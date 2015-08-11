var express = require('express'),
    app = express();

require('../index').init(app);



exports.listen = function (port, callback) {
    this.server = app.listen(port, callback);
};

exports.close = function (callback) {
    this.server.close(callback);
};
app.use(require('../index').read());


app.get('/petriMiddlware', function (req, res) {

    var domain = require('wix-node-domain').wixDomain();
    res.send(domain.petriCookies);
});
