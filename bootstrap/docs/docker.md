# Deployment descriptor - ./Dockerfile

Given you want to deploy your app to wix production, you need to add `Dockerfile` to a root of your module. CI will use it to create docker image and wil publish to internal docker registry where it will be picked-up and deployed later on.

Bootstrap provides you a base docker image with most of the required things done. It is built on top of [wix-node-docker-base](https://github.com/wix/wix-node-docker-base) with following additions:
 - 'wix-bootstrap' config tempaltes (.erb);
 - node version switch script 'use-node-from-nvmrc' installed globally.

# Usage

## Using base image from `wix-bootstrap`

Add `.dockerignore` file - not necessary, but helps with simpler instructions in your `Dockerfile` and speeds-up docker image creation. Example `.dockerignore` for a node-based app:

```
node_modules/
target/
test/
```

Add `Dockerfile` to a root of your app:

```
FROM docker-repo.wixpress.com/com.wixpress.npm.wix-bootstrap:snapshot
MAINTAINER You <you@wix.com>

# add config templates - *.erb
ADD templates/* /templates/

# add all app assets - .dockerignore excludes heavy stuff (node_modules, target).
COPY . /app/

# install and use node version from .nvmrc
RUN use-node-from-nvmrc

# install deps
RUN npm install --production

# switch to unprivileged user to run your app
USER deployer

# given /app/index.js exists
CMD node index.js
```

## Having custom `Dockerfile` composition

You can do that, but then check what [wix-bootstrap](./wix-bootstrap) and [wix-node-docker-base](https://github.com/wix/wix-node-docker-base) are doing/configuring in their `Dockerfile`s.