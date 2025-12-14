# Egyptian Service Marketplace - Development Commands

.PHONY: help install dev frontend backend migrate seed test test-fe test-be lint format build deploy clean

# Default target
help:
	@echo "Egyptian Service Marketplace - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make install     - Install all dependencies"
	@echo "  make dev        - Start all services"
	@echo "  make frontend   - Start frontend only"
	@echo "  make backend    - Start backend only"
	@echo ""
	@echo "Database:"
	@echo "  make migrate    - Run database migrations"
	@echo "  make seed      - Seed with sample data"
	@echo ""
	@echo "Testing:"
	@echo "  make test      - Run all tests"
	@echo "  make test-fe   - Frontend tests only"
	@echo "  make test-be   - Backend tests only"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint      - Lint all code"
	@echo "  make format    - Format all code"
	@echo ""
	@echo "Production:"
	@echo "  make build     - Build for production"
	@echo "  make deploy    - Deploy to staging/production"
	@echo ""

# Installation
install:
	@echo "📦 Installing dependencies..."
	cd backend && python -m pip install -r requirements.txt
	cd frontend && npm install
	@echo "✅ Dependencies installed successfully!"

# Development
dev:
	@echo "🚀 Starting all services..."
	docker-compose up -d

frontend:
	@echo "🎨 Starting frontend development server..."
	cd frontend && npm run dev

backend:
	@echo "⚙️ Starting backend development server..."
	cd backend && python manage.py runserver

# Database
migrate:
	@echo "📊 Running database migrations..."
	cd backend && python manage.py migrate

seed:
	@echo "🌱 Seeding database with sample data..."
	cd backend && python manage.py loaddata fixtures/sample_data.json

# Testing
test: test-be test-fe

test-fe:
	@echo "🧪 Running frontend tests..."
	cd frontend && npm run test

test-be:
	@echo "🧪 Running backend tests..."
	cd backend && python -m pytest

# Code Quality
lint:
	@echo "🔍 Linting code..."
	cd backend && ruff check . && black --check .
	cd frontend && npm run lint

format:
	@echo "✨ Formatting code..."
	cd backend && black . && ruff check --fix .
	cd frontend && npm run format

# Production
build:
	@echo "🏗️ Building for production..."
	cd frontend && npm run build
	cd backend && python manage.py collectstatic --noinput

deploy:
	@echo "🚀 Deploying to production..."
	# Add your deployment commands here
	@echo "Deployment configuration needed in /infra"

# Cleanup
clean:
	@echo "🧹 Cleaning up..."
	docker-compose down
	cd frontend && rm -rf node_modules dist
	cd backend && find . -name "*.pyc" -delete && find . -name "__pycache__" -delete