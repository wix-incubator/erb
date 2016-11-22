module.exports = config => {
  if (config.engine && config.engine === 'yarn') {
    return new YarnEngine();
  } else {
    return new NpmEngine();
  }
};

class NpmEngine {
  constructor() {
  }
  
  bootstrap(links) {
    if (links.length > 0) {
      return `npm link '${links.join('\' \'')}' && npm install`;
    } else {
      return 'npm install';
    }
  }
  
  run(cmd) {
    return `npm run ${cmd}`;
  }
}

class YarnEngine {
  constructor() {
  }

  bootstrap(links) {
    if (links.length > 0) {
      return `yarn link '${links.map(link => link.split('/').pop()).join('\' \'')}' && yarn install --ignore-engines && yarn link`;
    } else {
      return 'yarn install --ignore-engines && yarn link';
    }
  }

  run(cmd) {
    return `yarn run ${cmd}`;
  }
}
