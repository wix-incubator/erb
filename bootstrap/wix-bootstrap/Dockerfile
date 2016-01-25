FROM docker-repo.wixpress.com/com.wixpress.wix-node:latest
MAINTAINER Vilius Lukosius <vilius@wix.com>

# add bootstrap configs
ADD templates/* /templates/

# add script for installing correct node version
COPY scripts/use-node-from-nvmrc.sh /root/use-node-from-nvmrc.sh
RUN chmod +x ~/use-node-from-nvmrc.sh && ln -sf ~/use-node-from-nvmrc.sh /usr/local/bin/use-node-from-nvmrc