#!/bin/bash

yarn install
curl https://cli-assets.heroku.com/install.sh | sh
git remote add heroku https://git.heroku.com/clackbot.git
cp .env.codespace .env
sudo apt-get update
sudo apt-get install -y postgresql-client
echo "CREATE DATABASE clackbot_test;" | psql
echo "CREATE ROLE clackbot_test LOGIN PASSWORD 'clackbot';" | psql
echo "GRANT CONNECT ON DATABASE clackbot_test TO clackbot_test;" | psql
echo "GRANT USAGE ON SCHEMA public TO clackbot_test;" | psql
echo "GRANT ALL PRIVILEGES ON DATABASE clackbot_test TO clackbot_test;" | psql
yarn knex migrate:latest
