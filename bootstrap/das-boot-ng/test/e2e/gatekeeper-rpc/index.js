const axios = require('axios');
const DockerizedTestkit = require('../docker/dockerized-testkit');
const docker = require('../docker/main');

module.exports = class GatekeeperDockerizedTestkit extends DockerizedTestkit {
  constructor() {
    super(__dirname, 'wix-gatekeeper-testkit:local', 'wix-gatekeeper-testkit', {ports: ['3002/tcp']});
  }

  doStart() {
    return super.doStart()
      .then(() => docker.getPort(this.containerName, 3002))
      .then(port => this.port = port);
  }
  
  appendConfiguration(configEmitter) {
    return configEmitter
      .fn('service_url', 'com.wixpress.authorization.gatekeeper.gatekeeper-server', 'http://wix-gatekeeper-testkit:3001');
  }

  givenUserPermission(...args) {
    return this._callManagementMethod('givenUserPermission', args);
  }

  reset(...args) {
    return this._callManagementMethod('reset', args);
  }
  
  _callManagementMethod(method, args) {
    return axios.post(`http://${docker.dockerHost}:${this.port}/${method}`, args)
      .then(res => res.data)
      .catch(err => {
        console.log(err);
        return Promise.reject(err);
      });
  }
};
