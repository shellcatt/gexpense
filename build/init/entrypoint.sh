#!/bin/bash

export GOOGLE_APPLICATION_CREDENTIALS=/.service-account-key.json
if [ ! -f "${GOOGLE_APPLICATION_CREDENTIALS}" ]; then
 echo "[Error] ${GOOGLE_APPLICATION_CREDENTIALS} file empty, bye"
 exit 1
fi

echo 'initializing...'

npm install 


# Still wait
tail -f /dev/null