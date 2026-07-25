.PHONY: up down rebuild logs migrate migrate-create migrate-rollback seed seed-create pgcli 

up:
	docker compose up -d

down:
	docker compose down
	
rebuild:
	docker compose down -v && docker compose up --build -d

logs:
	docker compose logs -f

migrate:
	npm run migrate

migrate-create:
	npm run migrate:make

migrate-rollback:
	npm run migrate:rollback

seed:
	npm run seed

seed-create:
	npm run seed:make

pgcli:
	pgcli postgres://postgres@localhost:5432/eazybox

