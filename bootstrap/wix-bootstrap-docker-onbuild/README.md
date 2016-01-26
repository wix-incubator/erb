# wix-bootstrap-docker-onbuild

Base image for bootstrap-based apps given you have following in your app/repo/module:
 - './templates/*.erb' - at least empty one.
 - .nvmrc - that defines node version for you app;
 - index.js - entrypoint script.

In this case you just need boilerplace files to be available in root of your project: 'Dockerfile' and '.dockerignore'.

# Usage

Add `.dockerignore`:

```
node_modules/
target/
test/
```

Add `Dockerfile`:

```
FROM docker-repo.wixpress.com/com.wixpress.npm.wix-bootstrap-onbuild:snapshot
MAINTAINER You <you@wix.com>
```

That's it. This image uses ONBUILD docker directives to move needed assets to docker image and perform other needed preparations.