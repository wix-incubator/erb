const co = require('co');
const {exec, spawn} = require('child_process');
const shellEscape = require('shell-escape');

const networkName = 'das-boot';
const dockerLabel = 'das-boot-e2e';

const logInfo = console.log;
const logError = console.log;

function escape(arg) {
  return shellEscape([arg]);
}

function runDockerCommand(command) {
  const dockerCommand = `docker ${command}`;
  logInfo('running docker command: ', dockerCommand);
  return new Promise((resolve, reject) => exec(dockerCommand, (err, data) => err ? reject(err) : resolve(data.trim())));
}

function runDockerCommandWithOutput(command) {
  const dockerCommand = `docker ${command}`;
  logInfo('running docker command with output: ', dockerCommand);
  const [processName, ...args] = dockerCommand.split(' ');
  const dockerProcess = spawn(processName, args, {stdio: 'inherit'});
  return new Promise((resolve, reject) => {
    dockerProcess.once('exit', function (code) {
      if (code !== 0) {
        reject(new Error(`Docker process exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

exports.createContainer = function createContainer(containerName, imageName, opts) {
  return runDockerCommand(prepareContainerCommandLine('create', containerName, imageName, false, opts));
};

exports.runContainer = function runContainer(containerName, imageName, opts) {
  return runDockerCommand(prepareContainerCommandLine('run', containerName, imageName, true, opts));
};

function prepareContainerCommandLine(dockerCommand, containerName, imageName, detach, {environment = {}, ports = [], command = '', extraFlags = ''}) {
  const envStrings = Object.keys(environment).map((key) => {
    const value = environment[key];
    const envString = `${key}=${value}`;
    return `-e ${escape(envString)}`;
  }).join(' ');
  const portString = ports.map((port) => `-p ${port}`).join(' ');
  const detachString = detach ? '-d' : '';
  return `${dockerCommand} --label=${dockerLabel} --network=${networkName} ${detachString} --name=${containerName} ${envStrings} ${portString} ${extraFlags} ${imageName} ${command}`
}

exports.removeIfExists = co.wrap(function *(containerName, dumpLogs = false, dumpLogsFromFiles = []) {
  try {
    if (dumpLogs) {
      logInfo(`<<<<<<<<<<<<<<<< logs for container ${containerName} >>>>>>>>>>>>>>>>>>>>>>>`);
      yield runDockerCommandWithOutput(`logs ${containerName}`);
      logInfo(`<<<<<<<<<<<<<<<< end logs for container ${containerName} >>>>>>>>>>>>>>>>>>>>>>>`);
      for (let i = 0; i < dumpLogsFromFiles.length; i++) {
        yield runDockerCommandWithOutput(`cp ${containerName}:${dumpLogsFromFiles[i]} -`);
      }
    }
    return yield runDockerCommand(`rm -fv ${escape(containerName)}`);
  } catch (err) {
    logError(`failed to remove container ${containerName}`, err);
  }
});


exports.getPort = function getPort(container, port) {
  return runDockerCommand(`port ${container} ${port}`)
    .then(ipAndPort => ipAndPort.split(':')[1]);
};

exports.startContainer = function startContainer(containerName) {
  return runDockerCommand(`start ${containerName}`);
};

function removeOwnContainers() {
  return co(function *() {
    const containers = yield runDockerCommand(`ps -aq -f 'label=${dockerLabel}'`);
    if (containers.trim().length > 0) {
      yield runDockerCommand(`rm -fv ${containers.replace(/\n/g, ' ')}`);
    }
  })
}

function removeOwnNetworks() {
  return co(function *() {
    const networks = yield runDockerCommand(`network ls -q -f 'label=${dockerLabel}'`);
    if (networks.trim().length > 0) {
      yield runDockerCommand(`network rm ${networks.replace(/\n/g, ' ')}`);
    }
  })
}

function createNetwork() {
  return runDockerCommand(`network create --label=${dockerLabel}  -d bridge das-boot`);
}

function cleanUp() {
  return co(function *() {
    yield removeOwnContainers();
    yield removeOwnNetworks();
  })
}


function determineHost() {
  const dockerHost = process.env.DOCKER_HOST
  if (dockerHost) {
    return dockerHost.substring(6, dockerHost.lastIndexOf(':'))
  } else {
    return 'localhost'
  }
}

before(cleanUp);
before(createNetwork);

exports.dockerHost = determineHost()
exports.runDockerCommand = runDockerCommand;
exports.runDockerCommandWithOutput = runDockerCommandWithOutput;
