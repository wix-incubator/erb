const {join} = require('path'),
  {writeFileSync} = require('fs'),
  {execSync} = require('child_process');

const npmrcConfig = process.env['NPMRC_CONFIG'];
const publishRegistry = process.env['PUBLISH_REGISTRY'];
const packageJsonPath = join(process.cwd() + '/package.json');
const packageJson = require(packageJsonPath);

addNpmRc(npmrcConfig);
overridePublishConfig(packageJson, publishRegistry);
updateVersion(packageJson);

writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, '  '));

function addNpmRc() {
	writeFileSync('.npmrc', npmrcConfig);
}

function overridePublishConfig(packageJson, publishRegistry) {
	packageJson.publishConfig = {registry: publishRegistry};
}

function updateVersion(packageJson) {
	if (process.env['BUILD_NUMBER'] === undefined) {
		throw new Error('env variable BUILD_NUMBER is missing - cannot construct safe-publishable version');
	} else {
		const newMajorVersion = process.env['BUILD_NUMBER'].replace(/#/g, '');
		const newVersion = newMajorVersion + '.0.0';
		packageJson.version = newVersion;
	}
}
