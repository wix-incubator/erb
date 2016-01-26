FROM docker-repo.wixpress.com/com.wixpress.npm.wix-bootstrap:snapshot
MAINTAINER Vilius Lukosius <vilius@wix.com>

# add config templates - *.erb
COPY templates /templates/

# add all app assets - .dockerignore excludes heavy stuff (node_modules, target).
COPY . /app/

# install and use node version from .nvmrc
RUN install-node-nvm.sh

# install deps
RUN npm install --production

# given /app/index.js exists
CMD node index.js