# wix-bootstrap-onbuild

Base autopilot-images for bootstra-based apps that use [wix-node](https://github.com/wix-private/wix-node-docker-base) images and:
 - set some bootstrap-specific environment variables for you (logging, etc.);
 - copy your app assets to container;
 - runs npm install, etc.

There are 2 supported versions/tags:
 - 'stable' -> 'docker-repo.wixpress.com/wix-bootstrap-onbuild:stable' - based on node version that is currently considered stable in wix. Base image: 'docker-repo.wixpress.com/wix-node:N', where N is node version.
 - 'latest' -> 'docker-repo.wixpress.com/wix-bootstrap-onbuild:latest' - based on node version that is currently considered stable in wix. Base image: 'docker-repo.wixpress.com/wix-node:N + x', where N is node version, x is 1 or 2.

Ex. `docker-repo.wixpress.com/wix-bootstrap-onbuild:stable` is based off of `docker-repo.wixpress.com/wix-node:6` and `docker-repo.wixpress.com/wix-bootstrap-onbuild:latest` is based off of `docker-repo.wixpress.com/wix-node:7`.

# usage

You just need boilerplace files to be available in root of your project: 'Dockerfile' and '.dockerignore' so that CI would find 'Dockerfile' and build a docker image for deployment.

Add `.dockerignore`:

```
node_modules/
target/
test/
```

Add `Dockerfile` for 'stable':

```
FROM docker-repo.wixpress.com/wix-bootstrap-onbuild:stable
MAINTAINER You <you@wix.com>
```

Or add `Dockerfile` for 'latest' (not recommended):

```
FROM docker-repo.wixpress.com/wix-bootstrap-onbuild:latest
MAINTAINER You <you@wix.com>
```

**Note:** Minimum you need is `package.json` and `index.js` as `package.json` are used to insall dependencies and `index.js` is an entry point. If you need different set-up, you should either add custom `RUN` command or fallback to using one of the [wix-node](https://github.com/wix-private/wix-node-docker-base) base images.

That's it. This image uses ONBUILD docker directives to move needed assets to docker image and perform other necessary operations so that your app would run in production.
