const {join} = require('path'),
  {execSync} = require('child_process');

const packageJsonPath = join(process.cwd() + '/package.json');
const packageJson = require(packageJsonPath);

retrying(() => execSync('npm --cache-min 3600 install', {stdio: 'inherit'}));
execSync('npm run build', {stdio: 'inherit'});

if (packageJson.private === undefined || packageJson.private !== true) {
  execSync(`npm publish`, {stdio: 'inherit'});
}

function retrying(cb, left = 3) {
	try {
		cb();
	} catch (e) {
		console.log(`npm install failed, left tries: ${left}`);
		if (left !== 0) {
			retrying(cb, left - 1);
		} else {
			throw e;
		}
		
	}
}