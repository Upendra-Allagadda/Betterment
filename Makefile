.PHONY: all dev test build clean backend-dev frontend-dev

all: build

# Run both backend and frontend concurrently for local development
dev:
	@echo "Starting GoalOS Modular Monolith..."
	@which concurrently > /dev/null || npm install -g concurrently 2>/dev/null || true
	@(trap 'kill 0' SIGINT; \
		(cd backend && go run ./cmd/server) & \
		(cd frontend && npm run dev) & \
		wait)

# Run all test suites
test:
	@echo "==> Running Backend Tests..."
	@cd backend && go test -v -race ./...
	@echo "==> Running Frontend Typechecks & Build..."
	@cd frontend && npm run build

# Build production binaries and client bundle
build:
	@echo "==> Building Backend Binary..."
	@cd backend && go build -o bin/server ./cmd/server
	@echo "==> Building Frontend Client..."
	@cd frontend && npm run build
	@echo "Build complete."

# Backend only
backend-dev:
	@cd backend && go run ./cmd/server

# Frontend only
frontend-dev:
	@cd frontend && npm run dev

clean:
	@rm -rf backend/bin backend/data/*.db frontend/dist
