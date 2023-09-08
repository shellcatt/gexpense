#!/bin/bash

export GOOGLE_APPLICATION_CREDENTIALS=/.service-account-key.json
if [ ! -f "${GOOGLE_APPLICATION_CREDENTIALS}" ]; then
 echo "[Error] ${GOOGLE_APPLICATION_CREDENTIALS} file empty, bye"
 exit 1
fi

echo "Initializing target [$TARGET]..."
npm install

echo 'Lazy awaits 10 secs...'
sleep 10

echo 'Starting scan...'
npm start

echo 'Done.'
if [ $TARGET == "dev" ]; then
    echo 'press Ctrl+C to exit app'
    tail -f /dev/null
fi