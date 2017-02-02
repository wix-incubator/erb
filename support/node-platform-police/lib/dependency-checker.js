function isProduction(dep) {
  return dep.type === 'dependencies';
}

function isWixBootstrap(dep) {
  return dep.name.startsWith('wix-bootstrap');
}

function isLatest(dep) {
  return dep.wanted !== dep.latest;
}

function checkDependencies(outdated) {
  return Object.keys(outdated)
    .map(key => {
      const out = outdated[key];
      out.name = key;
      return out;
    })
    .filter(isProduction)
    .filter(isWixBootstrap)
    .filter(isLatest);
    // .map(toErrorMessage);
}

module.exports = checkDependencies;
