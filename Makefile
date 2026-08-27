.PHONY: up down rebuild logs install dev typecheck lint lint-fix format format-check verify test test-watch test-e2e test-e2e-ui test-db-reset migrate migrate-create migrate-rollback tokens admin seed pgcli mobile mobile-android mobile-ios mobile-web mobile-lint mobile-typecheck

LOAD_ENV := set -a; [ -f .env ] && . ./.env; set +a;

ARG_TARGETS := migrate-create
ifneq (,$(filter $(ARG_TARGETS),$(MAKECMDGOALS)))
  ARGS := $(filter-out $(ARG_TARGETS),$(MAKECMDGOALS))
  $(eval $(ARGS):;@:)
endif

up:
	docker compose up -d

down:
	docker compose down

rebuild:
	docker compose down -v && docker compose up --build -d

logs:
	docker compose logs -f

install:
	bun install --frozen-lockfile

dev:
	$(LOAD_ENV) bun run dev

typecheck:
	bun run typecheck

lint:
	bun run --filter @eazybox/web lint

lint-fix:
	bun run --filter @eazybox/web lint:fix

format:
	bun run --filter @eazybox/web format

format-check:
	bun run --filter @eazybox/web format:check

verify: typecheck lint test

test:
	bun run --filter @eazybox/web test

test-watch:
	bun run --filter @eazybox/web test:watch

test-e2e:
	bun run --filter @eazybox/web test:e2e

test-e2e-ui:
	bun run --filter @eazybox/web test:e2e:ui

test-db-reset:
	docker compose exec -T postgres psql -U postgres -d postgres -c "drop database if exists eazybox_test with (force)"

migrate:
	$(LOAD_ENV) bun run --filter @eazybox/web migrate

migrate-create:
	$(LOAD_ENV) bun run --filter @eazybox/web migrate:make $(ARGS)

migrate-rollback:
	$(LOAD_ENV) bun run --filter @eazybox/web migrate:rollback

tokens:
	bun run --filter @eazybox/web tokens

admin:
	$(LOAD_ENV) bun run --filter @eazybox/web admin:create

seed:
	$(LOAD_ENV) bun run --filter @eazybox/web db:seed

pgcli:
	pgcli postgres://postgres@localhost:5432/eazybox

mobile:
	cd app/mobile && bunx expo start --lan

mobile-android:
	cd app/mobile && bunx expo start --android

mobile-ios:
	cd app/mobile && bunx expo start --ios

mobile-web:
	cd app/mobile && bunx expo start --web

mobile-lint:
	bun run --filter @eazybox/mobile lint

mobile-typecheck:
	bun run --filter @eazybox/mobile typecheck
