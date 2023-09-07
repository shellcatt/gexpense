#!/bin/sh

PWD=$(pwd)
envfile="$PWD/.env"
. $envfile

CONFIG_DIR=$BUILDDIR/config

[ -d "$CONFIG_DIR" ] || mkdir -p $CONFIG_DIR

gcloud secrets versions access latest --secret="${SECRET_SA_KEY}" > "${CONFIG_DIR}/${SA_KEYFILE}" \
    && echo '[OK] Stored SA JSON key file'

[ -d "$INPUT_DIR" ] || mkdir -p $INPUT_DIR