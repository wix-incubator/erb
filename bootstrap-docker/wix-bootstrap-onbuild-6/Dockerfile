FROM docker-repo.wixpress.com/wix-node:6
MAINTAINER Vilius Lukosius <vilius@wix.com>

# set fw debug environment variables
ENV DEBUG="wnp:*,wix:*"

# copy .npmrc with ci permissions to container for npm install would work with ex. @wix scoped packages
COPY .npmrc ~/.npmrc

ONBUILD USER root

# add config templates - *.erb
ONBUILD COPY templates /templates/

# add all app assets - .dockerignore excludes heavy stuff (node_modules, target).
ONBUILD COPY . /app/

# clean node_modules if developer forgot to add '.dockerignore'
# fix permissions of added files.
ONBUILD RUN rm -rf /app/node_modules /app/target && \
    chown -R deployer:deployer /templates && \
    chown -R deployer:deployer /app

ONBUILD USER deployer

# install deps
ONBUILD RUN npm install --production

# rm .npmrc so it would not be in prod artifact
ONBUILD RUN rm ~/.npmrc

# given /app/index.js exists
ONBUILD CMD ["node", "index.js"]