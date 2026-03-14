.PHONY: up down restart build logs console sh db-migrate db-rollback \
       db-seed db-reset db-create db-prepare test setup clean

up:
	docker compose up -d

up-attached:
	docker compose up

down:
	docker compose down

restart:
	docker compose restart

build:
	docker compose build

build-no-cache:
	docker compose build --no-cache

logs:
	docker compose logs -f

logs-web:
	docker compose logs -f web

ps:
	docker compose ps

console:
	docker compose exec web bin/rails console

sh:
	docker compose exec web bash

routes:
	docker compose exec web bin/rails routes

db-create:
	docker compose exec web bin/rails db:create

db-migrate:
	docker compose exec web bin/rails db:migrate

db-rollback:
	docker compose exec web bin/rails db:rollback

db-seed:
	docker compose exec web bin/rails db:seed

db-reset:
	docker compose exec web bin/rails db:reset

db-prepare:
	docker compose exec web bin/rails db:prepare

db-status:
	docker compose exec web bin/rails db:migrate:status

db-console:
	docker compose exec db psql -U eazybox eazybox_development

test:
	docker compose run --rm -e RAILS_ENV=test test

test-prepare:
	docker compose exec web bin/rails db:test:prepare

lint:
	docker compose exec web bin/rubocop

lint-fix:
	docker compose exec web bin/rubocop -A

security:
	docker compose exec web bin/brakeman

audit:
	docker compose exec web bin/bundler-audit

setup:
	docker compose up -d --build
	docker compose exec web bin/rails db:prepare

clean:
	docker compose down -v
