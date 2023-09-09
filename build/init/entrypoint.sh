#!/bin/bash

PWD=$(pwd)

##TODO: always sync with `docker-compose.yml`
export GOOGLE_APPLICATION_CREDENTIALS="/etc/gcloud/${SA_KEYFILE}"
if [ ! -f "${GOOGLE_APPLICATION_CREDENTIALS}" ]; then
 echo "[Error] ${GOOGLE_APPLICATION_CREDENTIALS} file empty, did you run `make install` on host?"
 exit 1
fi

[ $TARGET == "prod" ] && TARGET_COLORED="\033[0;32m$TARGET\033[0m" || TARGET_COLORED="\033[0;33m$TARGET\033[0m"

echo -e "Initializing target [$TARGET_COLORED]..."
[ -d "node_modules" ] || npm install

echo 'Lazy awaits 10 secs...'
sleep 10

echo 'Starting scan...'
npm start

echo 'Done.'
if [ $TARGET == "dev" ]; then
    echo 'press Ctrl+C to exit app'
    tail -f /dev/null
fi