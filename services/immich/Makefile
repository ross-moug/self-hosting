__PHONY__: upgrade,cleanup

upgrade: docker compose pull && docker compose up -d

cleanup: docker image prune
