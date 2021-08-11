# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.187.0/containers/javascript-node/.devcontainer/base.Dockerfile

# [Choice] Node.js version: 16, 14, 12
ARG VARIANT="16-buster"
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}

# The node image includes a non-root user with sudo access. Use the
# "remoteUser" property in devcontainer.json to use it. On Linux, update
# these values to ensure the container user's UID/GID matches your local values.
# See https://aka.ms/vscode-remote/containers/non-root-user for details.
# ARG USERNAME=node
# ARG USER_UID=1000
# ARG USER_GID=$USER_UID

# # Configure apt and install packages
# RUN apt-get update \
#     && apt-get -y install --no-install-recommends apt-utils dialog 2>&1 \
#     #
#     # Install eslint globally
#     && npm install -g eslint \
#     #
#     # [Optional] Update a non-root user to UID/GID if needed.
#     && if [ "$USER_GID" != "1000" ] || [ "$USER_UID" != "1000" ]; then \
#     groupmod --gid $USER_GID $USERNAME \
#     && usermod --uid $USER_UID --gid $USER_GID $USERNAME \
#     && chown -R $USER_UID:$USER_GID /home/$USERNAME; \
#     fi \
#     # [Optional] Add add sudo support for non-root user
#     && apt-get install -y sudo \
#     && echo node ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
#     && chmod 0440 /etc/sudoers.d/$USERNAME \
#     #
#     # Clean up
#     && apt-get autoremove -y \
#     && apt-get clean -y \
#     && rm -rf /var/lib/apt/lists/*
