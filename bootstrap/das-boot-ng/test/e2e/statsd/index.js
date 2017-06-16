const DockerizedTestkit = require('../docker/dockerized-testkit');
const axios = require('axios');
const docker = require('../docker/main');

module.exports = class StatsdDockerizedTestkit extends DockerizedTestkit {
  constructor() {
    super(__dirname, 'wix-statsd-testkit:local', 'wix-statsd-testkit', {ports: ['3001/tcp']});
  }

  doStart() {
    return super.doStart()
      .then(() => docker.getPort(this.containerName, 3001))
      .then(port => this.port = port);
  }

  appendConfiguration(configEmitter) {
    return configEmitter
      .val('statsd_host', 'wix-statsd-testkit');
  }

  events(fragment = '') {
    return axios.get(`http://${docker.dockerHost}:${this.port}/events/${encodeURIComponent(fragment)}`).then(res => res.data);
  }
  
  reset() {
    return axios.get(`http://${docker.dockerHost}:${this.port}/reset`);
  }
};
