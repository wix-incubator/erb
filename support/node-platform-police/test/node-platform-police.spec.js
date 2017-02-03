const expect = require('chai').expect,
  shelljs = require('shelljs'),
  join = require('path').join,
  pkg = require('../package.json');

describe('node-platform-police', function() {
  this.timeout(60000);
  const tgzFileName = `node-platform-police-${pkg.version}.tgz`;
  
  before(() => {
    shelljs.exec('npm pack .');
    shelljs.mkdir('-p', './target/');
    shelljs.mv(`./${tgzFileName}`, './target/');
  });
  after(() => shelljs.rm('-f', join('target', tgzFileName)));

  it('should fail with outdated dependency', () => {
    const destModule = setupModule('module-with-outdated-node-platform-dependencies');
    const res = runCmd(destModule);
    const moduleName = 'wix-bootstrap-bi';
    const moduleVersion = getLatestPackageVersion(moduleName);
    expect(res.stderr).to.be.string(`Found outdated bootstrap dependency ${moduleName}:0.0.1 -> latest version is ${moduleVersion}`);
    expect(res.code).to.be.equal(1);
  });

  it('should pass with up to date dependencies', () => {
    const destModule = setupModule('module-with-up-to-date-node-platform-dependencies');
    const res = runCmd(destModule);
    const moduleName = 'wix-bootstrap-bi';
    expect(res.stderr).not.contains(`Found outdated bootstrap dependency ${moduleName}`);
    expect(res.code).to.be.equal(0);
  });

  it('should allow to opt out from dependencies check', () => {
    const destModule = setupModule('module-with-opt-out');
    const res = runCmd(destModule);
    const moduleName = 'wix-bootstrap-bi';
    expect(res.stderr).not.contains(`Found outdated bootstrap dependency ${moduleName}`);
    expect(res.code).to.be.equal(0);
  });

  function setupModule(name) {
    const destModule = join(process.cwd(), `./target/${name}`);
    const srcModule = join(process.cwd(), `./test/${name}`);
    
    shelljs.rm('-rf', destModule);
    shelljs.mkdir('-p', destModule);
    shelljs.cp('-R', srcModule + '/', destModule);
    
    return destModule
  }
  
  function getLatestPackageVersion(pkg) {
    return shelljs.exec(`npm view ${pkg} version`).stdout;
  }

  function runCmd(moduleDir) {
    shelljs.pushd(moduleDir);
    const execResult = shelljs.exec(`npm install ../${tgzFileName} && node_modules/.bin/node-platform-police`);
    shelljs.popd();
    return execResult;
  }

});
