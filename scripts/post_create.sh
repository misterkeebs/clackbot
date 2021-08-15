#!/bin/bash

yarn install
curl https://cli-assets.heroku.com/install.sh | sh
git remote add heroku https://git.heroku.com/clackbot.git
cp .env.codespace .env
