const co = require('co');
const {TestkitBase} = require('wix-testkit-base');
const docker = require('./main');
const eventually = require('wix-eventually');
const cwd = process.cwd();
const fs = require('fs');
const {mkdirpSync} = require('fs-extra')
const axios = require('axios');

const imageName = process.env.IMAGE_NAME;
const configEmitter = require('wix-config-emitter');


module.exports = class DockerizedApp extends TestkitBase {
  constructor(collaborators, appendAppConfig) {
    super()
    this.collaborators = collaborators;
    this.appendAppConfig = appendAppConfig;
  }


  doStart() {
    const self = this;

    return co(function* startApp() {
      self.containerId = yield docker.createContainer('das-boot-ng', imageName, {
        ports: ['8080/tcp'],
        environment: {
          WIX_BOOT_STATSD_INTERVAL: 500,
          NODE_ENV: 'production',
          NEW_RELIC_ENABLED: false,
          NEW_RELIC_NO_CONFIG_FILE: true,
          NEW_RELIC_LOG: 'stdout'
        }
      });

      yield self._pullTemplates();
      yield self._emitConfigs();
      yield self._pushConfigs();

      yield docker.startContainer(self.containerId);

      self.appPort = yield docker.getPort(self.containerId, 8080);

      yield eventually(() => self._isAlive(), {timeout: 8000})
    });

  }

  doStop() {
    return docker.removeIfExists(this.containerId, true, ['/logs/stderr.log', '/logs/stdout.log'])
  }

  _isAlive() {
    return axios.get(this.getUrl('/health/is_alive'));
  }

  _pullTemplates() {
    mkdirpSync(`${cwd}/target/docker`);
    return docker.runDockerCommand(`cp ${this.containerId}:/templates ${cwd}/target/docker`)
      .then(() => new Promise((resolve, reject) => {
        fs.unlink(`${cwd}/target/docker/templates/newrelic.js.erb`, err => err ? reject(err) : resolve())
      }))
  }

  _pushConfigs() {
    return docker.runDockerCommand(`cp ${cwd}/target/docker/configs ${this.containerId}:/`);
  }

  _emitConfigs() {
    const baseEmitter = this.appendAppConfig(configEmitter({
      sourceFolders: ['./target/docker/templates'],
      targetFolder: './target/docker/configs'
    })
      .fn('service_url', 'com.wixpress.common.wix-petri-server', 'http://petri-server')
      .fn('service_url', 'com.wixpress.common.wix-laboratory-server', 'http://laboratory-server')
      .val('rpc_signing_password', 'rpc pass')
      .val('x_seen_by', 'seen by test')
      .fn('static_url', 'com.wixpress.static.wix-public', '//wix-public')
      .fn('library_passwd', 'new-session-public-key', 'lib pass'))
      .val('base_domain', 'das-boot-ng')
      .fn('rpc_service_url', 'com.wixpress.wix-html-login-webapp', 'http://login-webapp');


    const finalEmitter = this.collaborators.reduce(
      (emitter, collaborator) => collaborator.appendConfiguration(emitter),
      baseEmitter);
    return finalEmitter.emit();
  }

  getUrl(path) {
    return `http://${docker.dockerHost}:${this.appPort}${path}`
  }
}
