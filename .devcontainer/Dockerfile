FROM mcr.microsoft.com/devcontainers/javascript-node:0-18-bullseye

# somehows ARM64 packages are available but not listed on Release
ARG MONGO_TOOLS_VERSION=6.0
RUN . /etc/os-release \
    && wget "https://repo.mongodb.org/apt/debian/dists/bullseye/mongodb-org/6.0/main/binary-$(dpkg --print-architecture)/mongodb-mongosh_1.6.0_$(dpkg --print-architecture).deb" \
    && echo "466b819f21f838773f7ac094c838edf1b1c930fd27ad048c54cda9a3977a1a90  mongodb-mongosh_1.6.0_arm64.deb\n1ea166d482c3a30714bc60d2840dea00a7c8e1fd682cd1a4c9db2470463c0748  mongodb-mongosh_1.6.0_amd64.deb" | grep $(dpkg --print-architecture) | sha256sum --check \
    && dpkg -i mongodb-mongosh_1.6.0_arm64.deb \
    && rm mongodb-mongosh_1.6.0_arm64.deb

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node modules
# RUN su node -c "npm install -g <your-package-list-here>"



