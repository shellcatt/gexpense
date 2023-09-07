#!/bin/sh

PWD=$(pwd)
. "${PWD}/.env"
# export $("${PWD}/${BUILDDIR}/variables.sh")

TARGET=${1:-''}

docker compose -f "${PWD}/docker-compose${TARGET}.yml" up -d \
    && echo 'Done'

