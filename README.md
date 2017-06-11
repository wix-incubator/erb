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
 - ruby + bundler (`gem install bundler`);
 - docker;

Then clone repo:
```bash
git clone git@github.com:wix-platform/wix-node-platform.git && cd wix-node-platform
```

Install*:
```bash
npm install
```

 * installs platform build dependencies and adds pre-push hooks for dependency, module sync, etc.

Install and link modules*:
```bash
npm start bootstrap
```

 * installs all modules in repo, links them together via [npm links](https://docs.npmjs.com/cli/link) and also runs `build` scripts for all modules.

Create IntelliJ Idea/WebStorm project and open in Idea/Webstorm (given you have command line launcher):
```bash
npm start idea && idea .
```

Change codes and run tests incrementally*:
```bash
npm start test
```

 * first time it will run `npm test` for all modules, next runs will run tests only for changed ones and their dependees. 

Once you done - create a PR, check [PR CI](http://pullrequest-tc.dev.wixpress.com/viewType.html?buildTypeId=ServerPlatformJs_ServerPlatformJs) to complete and see if you are good:)
