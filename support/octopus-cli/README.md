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
        -n, --no-hook - do not add git pre-push hook for deps sync --save and modules sync --save 
    
	run - runs npm scripts for modules with changes
		-a, --all - run for all modules
		-n, --no-build - do not mark modules as built	

	exec - execute arbitrary bash script for modules with changes
		-a, --all - run for all modules

	deps - perform operations on managed module dependencies
		sync - sync module versions with managed dependency versions
			-s, --save - persist changes
	    extraneous - show managed dependencies that are not used in modules 
		unmanaged - show unmanaged module dependencies
		latest - show latest versions for managed dependencies

	modules - perform operations on managed modules
		sync - sync module versions with managed dependency versions
			-s, --save - persist changes
		list - list all managed modules
        changed - list modules that have changes
        unbuild - unbuild all modules
        build - make all modules built
```

where octopus.json:

```json
{
  "useNvm": true,
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