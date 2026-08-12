.PHONY: up down rebuild logs migrate migrate-create migrate-rollback seed seed-create pgcli 

up:
	docker compose up -d

down:
	docker compose down
	
rebuild:
	docker compose down -v && docker compose up --build -d

logs:
	docker compose logs -f

lint:
	bun run lint

format:
	bun run format

migrate:
	bun run --filter @eazybox/web migrate

migrate-create:
	bun run --filter @eazybox/web migrate:make

migrate-rollback:
	bun run --filter @eazybox/web migrate:rollback

seed:
	bun run --filter @eazybox/web seed

seed-create:
	bun run --filter @eazybox/web seed:make

pgcli:
	pgcli postgres://postgres@localhost:5432/eazybox

