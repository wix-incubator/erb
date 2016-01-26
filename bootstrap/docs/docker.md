# Deployment descriptor - ./Dockerfile

Given you want to deploy your app to wix production, you need to add `Dockerfile` to a root of your module. CI will use it to create docker image and will publish to internal docker registry where it will be picked-up and deployed later on.

For that bootstrap provides you serveral base images.

# Fully automatic

Given you don't have any special requirements and are building simple wix service, you can use [wix-bootstrap-docker-onbuild](./wix-bootstrap-docker-onbuild) do do all work for you.

# Semi-manual

Given you have some special assets or dependencies you need in your docker image, you can still use [wix-bootstrap-docker-onbuild](./wix-bootstrap-docker-onbuild), but it might interfere with your requirements, so you can always fall-back to [wix-bootstrap-docker-base](./wix-bootstrap-docker-base).

# Full manual

Ok, so you are special:) No worries, just see what is being done in [wix-bootstrap-docker-base](./wix-bootstrap-docker-base), [wix-bootstrap-docker-onbuild](./wix-bootstrap-docker-onbuild) and [wix-node-docker-base](https://github.com/wix/wix-node-docker-base) and copy/paste, replicate.

Just note - in case of any changes in `bootstrap` you are on your own. But you have tests, so you are good!