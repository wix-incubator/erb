const axios = require('axios');
const DockerizedTestkit = require('../docker/dockerized-testkit');
const docker = require('../docker/main');

module.exports = class RpcDockerizedTestkit extends DockerizedTestkit {
  constructor() {
    super(__dirname, 'wix-rpc-testkit:local', 'wix-rpc-testkit', {ports: ['3002/tcp']});
  }

  doStart() {
    return super.doStart()
      .then(() => docker.getPort(this.containerName, 3002))
      .then(port => this.port = port);
  }
  
  get serviceUrl() {
    return 'http://wix-rpc-testkit:3001';
  }
  
  reset() {
    return this._callManagementMethod('reset', []);
  }
  
  when(serviceName, methodName, response) {
    return this._callManagementMethod('when', [serviceName, methodName, response]);
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
