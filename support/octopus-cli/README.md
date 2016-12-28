# octopus-cli

A wrapper around [wnpm-dev](https://github.com/wix-private/wnpm/tree/master/wnpm-dev) for spjs development automation.

# install

```bash
npm insall -g octopus-cli
```

# About

Managing mono-repo or multi-module npm-based repos is hard and cumbersome. Some challenges that `octo` tries to solve:
 - dependency version across modules get desynced easily. octo allows to define single version of dependency (say mocha) and enforce it for all modules.
 - updating module versions - if you have a module that is used by other modules within same repo and you want to update a version, you have to go over modules that use it and update version in dependencies/devDependencies. Octo automates that;
 - setting up a multi-module project in idea - idea has no native support for multi-modules npm projects. octo solves that;
 - building multi-module project - octo helps you with that - install, link, build only changed modules (and dependencies within monorepo).

# Set-up

Run `octo init` that will:
 - add pre-push hooks for syncing module and dependency versions;
 - create new `octopus.json` if there is no one present.

# octopus.json

`octopus.json` is a configuration file for `octo` which can contain:
 - engine - npm or yarn that is used for install, run, link commands;
 - exclude - array of modules to be excluded;
 - dependencies, peerDependencies - hash of dependency names and versions that are enforced across monorepo. Note that dependencies listend in `dependencies` are enforced both for npm `dependencies` and `devDependencies`.
 
 Example:
 ```js
 {
  "engine": "yarn",
  "exclude": ["some-module-to-exclude"],
  "dependencies": {
    "chai": "~3.5.0",
    "eslint": "~3.10.2"
  },
  "peerDependencies": {
    "eslint-plugin-mocha": ">=2.0.0"
  }
}
 ```

# octo

`octo` is a command line tool for:
 - building monorepo (`octo bootstrap -n && octo run build test`) (with support of building only changed modules with proper module graph support);
 - running arbitrary npm scripts and commands for all/changed modules - `octo run test`, `octo exec 'echo 1'`;
 - managing module versions across monorepo - `octo modules`;
 - managing module dependency version across monorepo - `octo deps`;
 - generating intellij idea project for all modules within repo (with proper es6 setup, node_modules ignore and test runners) - `octo idea`;
 - self-updating - `octo selfupdate`.
 
## octo init

Should be used both for adding octo support for new project and setting-up local environment for cleanly checked-out octo-enabled project.

For a non-octo-enabled project:
 - add pre-push hooks for syncing module and dependency versions;
 - create new `octopus.json` if there is no one present.

For octo-enabled project:
 - add pre-push hooks for syncing module and dependency versions; 
 
## octo bootstrap

Runs npm|yarn install for all modules and also links inter-dependent modules across monorepo.

To check available options run `octo help bootstrap`;

## octo run [...npm scripts]

Runs scripts defined in `package.json` for all|changed modules. This is useful to run tests for all modules.

Example:
```bash
octo run -a build test
```

Will run `build` and `test` scripts defined in module `package.json` for all modules (-a).

To check available options run `octo help run`;

## octo exec '[cmd]'

Execute arbitrary script for all modules in monorepo.

Example:
```bash
octo exec -a 'rm -f .nvmrc && echo 6.9.2 > .nvmrc'
```

Will update version of node in .nvmrc to 6.9.2 for all modules (-a).

To check available options run `octo help exec`;

## octo idea

Generate/regenerate Intellij idea project for all modules within repo (Note that you might need to restart idea for changes to take effect). Generated project will have:
 - es6 js code style set-up;
 - node_modules set as ignored for indexing (to make sure intellij does actually work with 20+ modules);
 - run configurations generated for all modules (mocha).

Example:
```bash
octo idea
```

# octo deps

Manage dependencies across all modules. Common scenario is:
 - `octo deps latest` - to get a list of dependencies, that are defined in `octopus.json` and have newer version in registry.
 - update dependenciy versions in `octopus.json`;
 - `octo deps sync --save` - to update `package.json` for modules that need updating as per definitions in `octopus.json`;
 - `octo run bootstrap -n && octo run test` - to insall updated dependencies and run tests to verify if nothing broke.

To check available options run `octo help deps`;

# octo modules

Manage module versions and mark build/unbuild.

Common scenarion could be to update module version:
 - update version of a module in `package.json`;
 - run `octo modules sync --save` to update dependency version in modules that use a module with updated version.

To check available options run `octo help modules`;

# octo selfupdate

Update version of octopus-cli:)
