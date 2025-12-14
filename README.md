# Egyptian Service Marketplace (منصة الخدمات المصرية)

A production-grade, bilingual service marketplace designed specifically for the Egyptian market, supporting both Arabic (RTL) and English (LTR) interfaces.

## 🏗️ Architecture Overview

```
egyptian-marketplace/
├── backend/           # Django + DRF API
├── frontend/          # React SPA with RTL support
├── infra/            # Infrastructure & deployment
├── docs/             # Documentation
├── shared/           # Shared types & utilities
└── docker-compose.yml # Local development
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Docker & Docker Compose

### Local Development

1. **Clone and setup**:
```bash
git clone <repo-url>
cd egyptian-marketplace
make install
```

2. **Environment Setup**:
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your database and API keys

# Frontend  
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your API URLs
```

3. **Database Setup**:
```bash
make migrate
python backend/manage.py seed_egypt_data
python backend/manage.py seed_service_categories
python backend/manage.py create_superuser --phone=+201000000000 --name="مدير النظام" --password=admin123456
python backend/manage.py seed_sample_services
```

4. **Start services**:
```bash
make dev
```

5. **Access applications**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin
- API Documentation: http://localhost:8000/api/docs/

## 📋 Available Commands

```bash
# Development
make install        # Install all dependencies
make dev           # Start all services
make frontend      # Start frontend only
make backend       # Start backend only

# Database
make migrate       # Run database migrations
make seed         # Seed with sample data

# Testing
make test         # Run all tests
make test-fe      # Frontend tests only
make test-be      # Backend tests only

# Code Quality
make lint         # Lint all code
make format       # Format all code

# Production
make build        # Build for production
make deploy       # Deploy to staging/production
```

## 🌍 Localization Support

- **Primary**: Arabic (RTL) - العربية
- **Secondary**: English (LTR)
- Dynamic language switching with persistent storage
- Proper date/number formatting for Egyptian locale
- Currency support (EGP)
- Cultural considerations for Egyptian market

## 📱 Core Features

### For Service Providers
- Multi-language profile creation with ID verification
- Service listing with rich media upload
- Real-time messaging with customers
- Review and rating management
- Revenue analytics and reporting
- Admin moderation workflow

### For Customers  
- Advanced service search & filtering by location
- Arabic/English reviews system with helpfulness voting
- Secure messaging with service providers
- Real-time notifications for bookings and messages
- Favorites and service comparison
- Mobile-optimized booking flow

### Admin Dashboard
- User verification and document review
- Service content moderation
- Comprehensive reporting system
- Analytics & performance metrics
- System configuration management
- Audit trail for all admin actions

## 🔒 Security Features

- **Authentication**: JWT-based with refresh token rotation
- **Password Security**: Argon2 hashing with strength validation
- **Rate Limiting**: Comprehensive API protection
- **File Security**: Private storage for ID documents
- **Input Validation**: Server-side validation and sanitization
- **Audit Logging**: Complete trail of admin actions
- **CORS Protection**: Configured allowed origins
- **SSL/TLS**: HTTPS enforcement in production

## 🏭 Production Deployment

### Environment Variables

**Backend (.env)**:
```bash
# Core Django
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Redis
REDIS_URL=redis://localhost:6379/0

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Storage (AWS S3)
USE_S3=True
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_STORAGE_BUCKET_NAME=your-bucket-name
```

**Frontend (.env)**:
```bash
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_APP_NAME=Egyptian Service Marketplace
```

### Deployment Steps

1. **Database Setup**:
```bash
# Run migrations
python manage.py migrate

# Seed initial data
python manage.py seed_egypt_data
python manage.py seed_service_categories

# Create admin user
python manage.py create_superuser
```

2. **Build & Deploy**:
```bash
# Build frontend
cd frontend && npm run build

# Collect static files
cd backend && python manage.py collectstatic

# Deploy using your preferred method (Docker, AWS, etc.)
```

## 🔧 API Documentation

### Authentication Endpoints

```bash
POST /api/v1/accounts/auth/register/     # User registration
POST /api/v1/accounts/auth/login/        # User login
POST /api/v1/accounts/auth/logout/       # User logout
POST /api/v1/accounts/auth/refresh/      # Refresh JWT token
POST /api/v1/accounts/auth/otp/send/     # Send OTP
POST /api/v1/accounts/auth/otp/verify/   # Verify OTP
GET  /api/v1/accounts/profile/           # Get user profile
PATCH /api/v1/accounts/profile/update/   # Update profile
```

### Services Endpoints

```bash
GET  /api/v1/services/categories/        # List categories
GET  /api/v1/services/services/          # List services (with filters)
GET  /api/v1/services/services/{slug}/   # Service details
POST /api/v1/services/services/          # Create service
GET  /api/v1/services/featured/          # Featured services
GET  /api/v1/services/search/            # Advanced search
```

### Geography Endpoints

```bash
GET /api/v1/geo/governorates/            # Egyptian governorates
GET /api/v1/geo/centers/?gov_id=         # Centers by governorate
```

### Admin Endpoints

```bash
GET  /api/v1/accounts/admin/users/       # List users (admin)
PATCH /api/v1/accounts/admin/users/{id}/status/  # Update user status
GET  /api/v1/services/admin/services/    # List services for moderation
PATCH /api/v1/services/admin/services/{id}/status/  # Approve/reject service
```

## 📖 Documentation

- [API Documentation](http://localhost:8000/api/docs/) - Interactive Swagger UI
- [Internationalization Guide](docs/i18n.md) - Complete i18n implementation
- [UX Guidelines](docs/ux.md) - Responsive design patterns
- [Admin Guide](docs/admin.md) - Admin dashboard usage

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest
python -m pytest --cov=apps  # With coverage
```

### Frontend Tests
```bash
cd frontend
npm run test
npm run test:coverage
```

### Manual Testing Checklist

- [ ] User registration with phone verification
- [ ] Service creation and approval workflow
- [ ] Search and filtering functionality
- [ ] RTL/LTR language switching
- [ ] Mobile responsive navigation
- [ ] Admin dashboard functionality
- [ ] File upload and security
- [ ] Rate limiting and security measures

## 🔍 Monitoring & Debugging

### Development
- Django Debug Toolbar available in development
- React DevTools for frontend debugging
- API documentation at `/api/docs/`
- Admin interface at `/admin/`

### Production
- Sentry integration for error tracking
- Structured logging with audit trails
- Performance monitoring with metrics
- Security monitoring and alerts

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow code standards (Black for Python, Prettier for TypeScript)
4. Add tests for new functionality
5. Submit pull request with detailed description

### Code Standards

**Backend (Python)**:
- Black code formatting
- Ruff linting
- Type hints where applicable
- Comprehensive docstrings
- pytest for testing

**Frontend (TypeScript)**:
- ESLint + Prettier
- Strict TypeScript configuration
- Component documentation
- Jest + Testing Library

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: Check `/docs` directory
- **Issues**: Create GitHub issue with detailed description
- **Security**: Email security@marketplace.eg for security issues

---

**Built with ❤️ for the Egyptian market**

### Default Credentials (Development)

**Admin User**:
- Phone: +201000000000
- Password: admin123456

**Test Users**:
- Ahmed: +201012345678 / password123
- Fatma: +201098765432 / password123
- Mahmoud: +201123456789 / password123

### Sample Data

The platform includes:
- 27 Egyptian governorates with major cities
- 6 service categories with subcategories
- Sample services in Arabic and English
- Test users with verified status
- Admin user for moderation testing