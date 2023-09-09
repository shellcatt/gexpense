#!/bin/sh

PWD=$(pwd)
. "${PWD}/.env"

TARGET=${1:-''}

docker compose -f "${PWD}/docker-compose${TARGET}.yml" up \
    && echo 'Bye'

