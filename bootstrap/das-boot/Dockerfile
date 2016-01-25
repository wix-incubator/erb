FROM docker-repo.wixpress.com/com.wixpress.npm.wix-bootstrap:snapshot
MAINTAINER Vilius Lukosius <vilius@wix.com>

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