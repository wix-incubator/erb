# developers/contributors guide

Managing spjs and modules within is not that easy given npm does not support multi-module projects out of the box. For this multiple tools are built and maintained to ease some of maintenance tasks:
 - `pver` - managing versions of `spjs` modules repo-wide;
 - `pdep` - managing versions of `spjs` module dependencies repo-wide;
 - 'pbuild' - building `spjs`;
 - 'pdev' - support commands like generating idea project, executing tasks on all modules, etc.

## setup

Install:
 - [node](https://nodejs.org/en/) - duh:)
 - [nvm](https://github.com/creationix/nvm) - build might require multiple node versions during build/test phases.;
 - [spjs-tools](https://github.com/wix-private/spjs-tools) - tools listed above;
 - docker - defaults, dependent on your platform.

Make sure you update your ~/.npmrc according to [Nothing to prod](https://github.com/wix/nothing-to-prod/blob/master/explanations/installations.md#prerequisites-for-client-development) as well as:

```bash
npm config set save-prefix='~'
```

This is important to make sure modules are packaged with correct dependencies.

## building

To build repo you will need:
 - [nvm](https://github.com/creationix/nvm) - build might require multiple node versions during build/test phases.;
 - [spjs-tools](https://github.com/wix-private/spjs-tools) - tools listed above;
 - docker - defaults, dependent on your platform.

After you installend `nvm` and `docker`, in the root of your project just do:

``` bash
$ npm install -g spjs-tools
$ pbuild
```

This will build the whole repo. For additional options just run `pbuild --help` to see what options you have. Next runs will just build changes.

# versioning

TBD

```bash
pver up --major wix-logger
```

# managing dependencies

TBD

```bash
pdep up --dry-run
```