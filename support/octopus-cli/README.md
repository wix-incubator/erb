# octopus-cli

A thin wrapper around [grunt](http://gruntjs.com/) and [wnpm-dev](https://github.com/wix-private/wnpm/tree/master/wnpm-dev) for spjs development automation.

# Usage

Run `./init.sh` in the root of the repo to prepare it and then run `octo -h` to see available tasks.

# Future

```
octo --help
  -v, --verbose - verbose output
  -h, --help - print help
  -V, --version - print version
	
  Commands:
    
    init - initialize octopus for repository
        -h, --hook - add git pre-push hook for deps sync --save and modules sync --save 
    
	run - runs npm scripts for modules with changes
		-a, --all - run for all modules
		-n, --no-build - do not mark modules as built	

	exec - execute arbitrary bash script for all modules

	deps - perform operations on managed module dependencies
	    extraneous - show managed dependencies that are not use in managed modules 
		unmanaged - show unmanaged module dependencies
		latest - show latest versions for managed dependencies
		sync - sync module versions with managed dependency versions
			-s, --save - persist changes

	modules - perform operations on managed modules
		sync - sync module versions with managed dependency versions
			-s, --save - persist changes
		list - list all managed modules
        changed - list modules that have changes
        unbuild - unbuild all modules
```

where octopus.json:

```json
{
  "useNvm": true,
  "scs": "git",
  "postInit": "cp ./scripts/pre-push .git/hooks/pre-push",
  "scripts": {
    "clean": "rm -rf node_modules && rm -rf target && rm -f npm-debug.log && rm -f npm-shrinkwrap.json",
    "build": "npm run build",
  },
  "dependencies": {
    "lodash": "~1.2.3"
  },
  "peerDependencies": {
    "express": ">= 1.14.1"
  }
}
```

reserved scripts: 
 - install - runs npm install && npm links;
 - link - links modules together;