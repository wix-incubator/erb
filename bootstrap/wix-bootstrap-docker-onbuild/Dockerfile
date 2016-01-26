FROM docker-repo.wixpress.com/com.wixpress.wix-bootstrap-docker-base:snapshot
MAINTAINER Vilius Lukosius <vilius@wix.com>

# add config templates - *.erb
ONBUILD COPY templates /templates/

# add all app assets - .dockerignore excludes heavy stuff (node_modules, target).
ONBUILD COPY . /app/

# clean node_modules if developer forgot to add '.dockerignore'
ONBUILD RUN rm -rf /app/node_modules /app/target


# install and use node version from .nvmrc
ONBUILD RUN install-node-nvm.sh

# install deps
ONBUILD RUN npm install --production

# given /app/index.js exists
ONBUILD CMD node index.js