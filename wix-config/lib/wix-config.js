var fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

var cachedConfig;

var envKeys = [
  { key: "APP_NAME", type: String },
  { key: "PORT", type: Number },
  { key: "MANAGEMENT_PORT", type: Number },
  { key: "MOUNT_POINT", type: String }];


module.exports.get = function() {
  if (!cachedConfig)
    cachedConfig = new WixConfig().config;

  return cachedConfig;
};

function WixConfig() {
  var self = this;

  self.config = _loadAppConfig(process.env);

  if (!self.config.env)
    self.config.env = _loadEnvironment(process.env);
  else {
    self.config.env = _.extend(_loadEnvironment(process.env), self.config.env);
  }

  _.forEach(envKeys, function(item) {
    if (!self.config.env[_.camelCase(item.key)])
      throw Error("Could not load environment key for property: " + item.key);
  });
}

function _loadEnvironment(env) {
  var config = {};

  _.forEach(envKeys, function(item) {
    if (env[item.key])
      config[_.camelCase(item.key)] = item.type(env[item.key]);
  });

  return config;
}

function _loadAppConfig(env) {
  var confDir = env.APP_CONF_DIR ? env.APP_CONF_DIR : "/configs";
  var appName = _.last(env.APP_NAME.split("."));
  return JSON.parse(fs.readFileSync(path.join(confDir, appName + "-config.json"), 'utf8'));
}