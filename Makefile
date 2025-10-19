IMAGE_NAME=lspp-server
TAG=local

.PHONY: build docker-build docker-up docker-down dev test k8s-deploy

build:
	@echo "Nothing to build for JS source; see docker-build"

docker-build:
	docker build -t $(IMAGE_NAME):$(TAG) -f server/Dockerfile .

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down --volumes

dev:
	@echo "Run server locally with nodemon"
	cd server && npm run dev

test:
	@echo "Run quick smoke test against running container"
	curl -fS http://localhost:3000/health || (echo "health check failed" && exit 1)

k8s-deploy:
	@echo "Placeholder: use kubectl apply -f deploy/k8s to deploy"
