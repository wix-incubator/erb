# wix-bootstrap-onbuild

Base autopilot-images for bootstra-based apps that use [wix-node](https://github.com/wix-private/wix-node-docker-base) images and:
 - set some bootstrap-specific environment variables for you (logging, etc.);
 - copy your app assets to container;
 - runs npm install, etc.

There are 2 supported versions/tags:
 - 'stable' -> 'docker-repo.wixpress.com/wix-bootstrap-onbuild:stable' - based on node version that is currently considered stable in wix. Base image: 'docker-repo.wixpress.com/wix-node:stable'.
 - 'latest' -> 'docker-repo.wixpress.com/wix-bootstrap-onbuild:latest' - based on node version that is currently considered stable in wix. Base image: 'docker-repo.wixpress.com/wix-node:latest'.

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


That's it. This image uses ONBUILD docker directives to move needed assets to docker image and perform other necessary operations so that your app would run in production.
