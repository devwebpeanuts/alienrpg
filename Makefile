USER_ID=$(shell id -u)
GROUP_ID=$(shell id -g)
HOST_SOURCE_PATH=$(shell pwd)

#------------------------------------------------------------------------------

npm = docker run -ti --rm \
		-v ${HOST_SOURCE_PATH}:/var/foundry/project \
		-v ${HOME}/.npm:/.npm \
		-v ${HOME}/.config:/.config \
		-v ${HOME}/.gitconfig:/.gitconfig \
		-w /var/foundry/project \
		-u ${USER_ID}:${GROUP_ID} \
		--entrypoint="" \
		node:12 \
		npm ${1}

# Spread cli arguments
ifneq (,$(filter npm-install npm-uninstall npm-update, $(firstword $(MAKECMDGOALS))))
    NPM_CLI_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
    $(eval $(NPM_CLI_ARGS):;@:)
endif

#------------------------------------------------------------------------------
# NPM
#------------------------------------------------------------------------------
npm-install: npm-cache-dir
	$(call npm, install $(NPM_CLI_ARGS))

npm-update: npm-cache-dir
	$(call npm, update $(NPM_CLI_ARGS))

npm-uninstall: npm-cache-dir
	$(call npm, uninstall --silent $(NPM_CLI_ARGS))

npm-clean:
	-rm -rf node_modules

npm-clean-cache: npm-cache-dir
	$(call npm, cache clean --force)

npm-cache-dir:
	mkdir -p ~/.npm

#------------------------------------------------------------------------------
# Init
#------------------------------------------------------------------------------
init: npm-install

#------------------------------------------------------------------------------
# Build and packaging
#------------------------------------------------------------------------------
build:
	$(call npm, run build)

compile:
	$(call npm, run compile)

watch:
	$(call npm, run watch)

#------------------------------------------------------------------------------

.PHONY: npm-install npm-update npm-cache-dir npm-clean-cache ensureFoundrySystemDirExists init build