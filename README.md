# server-platform-js

Mono-repo for wixy node libraries for 'node as a front-end server'.

# to create a new service

 - Take a look at sample service [das-boot-ng](./bootstrap/das-boot-ng/);
 - Read documentation for basics and recipes at [bootstrap](./bootstrap).

Or just approach me (vilius@wix.com) with any questions you have.

# to contribute

You need following things to be present:
 - nvm, npm;
 - [octopus-cli](support/octopus-cli) - `nvm use && npm install -g octopus-cli && octo init`;
 - maven 3+, jdk 8+.
 - ruby + bundler (`gem install bunder`);
 - docker (docker-machine) + default/dev environment running with proper environment variables set-up.

Once you have everything set-up, just clone repo and run `octo bootstrap` in root of the repo. It will take some time on cold start (30 mins?), but next runs will build only changes, so will be much better.

# see also

 - [to access wix npm registry](http://kb.wixpress.com/pages/viewpage.action?title=Using+private+npm+registry&spaceKey=dashboard);
 - [local/ci npm support tools](https://github.com/wix/wnpm);
 - [wix node docker image](https://github.com/wix/wix-node-docker-base);
 - [jvm-based test servers](https://github.com/wix/server-platform-js-jvm);

# contributing

Checkout out [contributing](CONTRIBUTING.md) and issue pull request that follows [style guide](STYLE.md) and use common sense!
