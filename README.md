# server-platform-js

Mono-repo for wixy node libraries for 'node as a front-end server'.

# to create a new service

 - Take a look at sample service [das-boot-ng](./bootstrap/das-boot-ng/);
 - Read documentation for basics and recipes at [bootstrap](./bootstrap).

Or just approach me (vilius@wix.com) with any questions you have.

# to contribute

You need following things to be present:
 - nvm, npm;
 - maven 3+, jdk 8+.
 - ruby + bundler (`gem install bunder`);
 - docker;

Then clone repo:
```bash
git clone git@github.com:wix-private/server-platform-js.git && cd server-platform-js.git
```

Install [octopus-cli](support/octopus-cli):
```bash
npm install -g octopus-cli
```

Install and link modules:
```bash
octo bootstrap
```

Create IntelliJ Idea/WebStorm project and open in Idea/Webstorm (given you have command line launcher):
```bash
octo idea && idea .
```

Change codes and run tests via [octopus](support/octopus-cli) while developing:
```bash
octo run build test
```

Once you done - create a PR, check [PR CI](http://pullrequest-tc.dev.wixpress.com/viewType.html?buildTypeId=ServerPlatformJs_ServerPlatformJs) to complete and see if you are good:)


# see also

 - [to access wix npm registry](http://kb.wixpress.com/pages/viewpage.action?title=Using+private+npm+registry&spaceKey=dashboard);
 - [local/ci npm support tools](https://github.com/wix/wnpm);
 - [wix node docker image](https://github.com/wix/wix-node-docker-base);
 - [jvm-based test servers](https://github.com/wix/server-platform-js-jvm);

# contributing

Checkout out [contributing](CONTRIBUTING.md) and issue pull request that follows [style guide](STYLE.md) and use common sense!
