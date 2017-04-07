# server-platform-js

Mono-repo for wixy node libraries for [node as a front-end server](https://wix.dapulse.com/boards/1277/pulses/2316857).

## to create a new service

 - Generate and use tools provided by [wix-js-stack](https://github.com/wix-private/wix-js-stack/blob/master/docs/GETTING-STARTED.md);
 - Read documentation for basics and recipes at [bootstrap](./bootstrap).

Or just approach us (vilius@wix.com, daniels@wix.com) with any questions you have.

## see also

 - [to access wix npm registry](http://kb.wixpress.com/pages/viewpage.action?title=Using+private+npm+registry&spaceKey=dashboard);
 - [local/ci npm support tools](https://github.com/wix/wnpm);
 - [wix node docker image](https://github.com/wix/wix-node-docker-base);
 - [jvm-based test servers](https://github.com/wix/server-platform-js-jvm);

## to contribute

You need following things to be present:
 - nvm, npm;
 - maven 3+, jdk 8+.
 - ruby + bundler (`gem install bunder`);
 - docker;

Then clone repo:
```bash
git clone git@github.com:wix-platform/wix-node-platform.git && cd wix-node-platform
```

Install [octopus-cli](https://github.com/wix/octopus/tree/master/cli):
```bash
npm install -g octopus-cli
```

Init project:
```bash
octo init
```

Install and link modules:
```bash
octo bootstrap
```

Create IntelliJ Idea/WebStorm project and open in Idea/Webstorm (given you have command line launcher):
```bash
octo idea && idea .
```

Change codes and run tests via [octopus](https://github.com/wix/octopus/tree/master/cli) while developing:
```bash
octo run build test
```

Once you done - create a PR, check [PR CI](http://pullrequest-tc.dev.wixpress.com/viewType.html?buildTypeId=ServerPlatformJs_ServerPlatformJs) to complete and see if you are good:)
