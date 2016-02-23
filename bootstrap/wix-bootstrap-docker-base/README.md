# wix-bootstrap-docker-base

Base image for bootstrap-based apps. This image is built on top of [wix-node-docker-base](https://github.com/wix/wix-node-docker-base) but leaves you the job of adding config templates, app assets and whatever else you need.

Given you have a simple/common app, check-out if you can use more automated image: [wix-bootstrap-docker-onbuild](../wix-bootstrap-docker-onbuild).

# Usage

Add `.dockerignore` file - not necessary, but helps with simpler instructions in your `Dockerfile` and speeds-up docker image creation. Example `.dockerignore` for a node-based app:

```
node_modules/
target/
test/
```

Add `Dockerfile` to a root of your app:

```
FROM docker-repo.wixpress.com/com.wixpress.npm.wix-bootstrap-base:snapshot
MAINTAINER You <you@wix.com>

# add config templates - *.erb
ADD templates/* /templates/

# add all app assets - .dockerignore excludes heavy stuff (node_modules, target).
COPY . /app/

# install deps
RUN npm install --production

# given /app/index.js exists
CMD node index.js
```
