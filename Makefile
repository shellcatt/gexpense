#!make
include .env

.PHONY: build bin init data src

all: deploy

deploy: compose

compose: docker 
# target=([default]) [rebuild]
	${BUILDDIR}/compose.sh

docker: install
# target=([default]) [rebuild]
	${BUILDDIR}/docker.sh

install: ${BUILDDIR} clean
	${BUILDDIR}/install.sh

clean: stop
##TODO: uninstall.sh

##TODO: move to other targeted section
stop:
	docker compose down