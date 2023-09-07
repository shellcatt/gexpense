#!/bin/sh

PWD=$(pwd)
envfile="$PWD/.env"
. $envfile

TARGET=${1:-$TARGET}

docker build --target $TARGET . -t $IMAGEID:$VERSION \
    && echo 'Done'