#!/bin/sh

PWD=$(pwd)
envfile="$PWD/.env"
. $envfile

##TODO: always sync this with .gitignore 
CONFIG_DIR=$BUILDDIR/.gcloud 

[ -d "$CONFIG_DIR" ] || mkdir -p $CONFIG_DIR

gcloud secrets versions access latest --secret="${SECRET_SA_KEY}" > "${CONFIG_DIR}/${SA_KEYFILE}" \
    && echo '[OK] Stored SA JSON key file'

[ -d "$DATA_DIR" ] || mkdir -p $DATA_DIR
[ -d "$DATA_DIR" ] && touch "$DATA_DIR/$DATA_FILE"
[ -d "$INPUT_DIR" ] || mkdir -p $INPUT_DIR
[ -d "$OUTPUT_DIR" ] || mkdir -p $OUTPUT_DIR