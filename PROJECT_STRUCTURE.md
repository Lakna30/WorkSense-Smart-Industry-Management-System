# WorkSense - MERN Stack Project Structure

## ✅ Database Status: CONNECTED & WORKING

### Backend Structure (Node.js + Express + PostgreSQL)
```
backend/
├── src/
│   ├── controllers/          # Business logic
│   │   ├── auth.controller.js    # Authentication (login, register, profile)
│   │   └── employee.controller.js # Employee CRUD operations
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js              # JWT authentication & authorization
│   │   ├── validation.js        # Input validation
│   │   └── errorHandler.js      # Error handling
│   ├── routes/              # API routes
│   │   ├── auth.routes.js       # Authentication endpoints
│   │   ├── employee.routes.js   # Employee endpoints
│   │   └── index.js             # Route aggregator
│   ├── app.js               # Express app configuration
│   └── server.js            # Server startup
├── migrations/              # Database schema
│   ├── 001_create_employees_table.js
│   └── 002_create_users_table.js
├── seeds/                   # Sample data
│   ├── 001_employees.js
│   └── 002_users.js
├── knexfile.js             # Database configuration
├── package.json
└── .env                    # Environment variables
```

### Frontend Structure (React + Vite)
```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── layout/            # Layout components
│   │   └── ui/               # UI components
│   ├── pages/              # Route components
│   │   ├── Dashboard.jsx
│   │   ├── Employees.jsx
│   │   ├── Login.jsx
│   │   └── ...
│   ├── lib/                # Utilities
│   │   ├── api.js             # API client
│   │   ├── auth.js            # Auth utilities
│   │   └── store.js           # State management
│   ├── routes/             # Routing
│   └── styles/             # CSS
└── package.json
```

## 🗄️ Database Tables

### Users Table
- `id` (Primary Key)
- `email` (Unique)
- `password_hash`
- `first_name`, `last_name`
- `role` (admin, user, manager)
- `is_active`
- `last_login`
- `created_at`, `updated_at`

### Employees Table
- `id` (Primary Key)
- `first_name`, `last_name`
- `email` (Unique)
- `phone`, `photo_url`
- `job_title`, `department`
- `skills`, `certifications`
- `emergency_contact_*`
- `employee_id` (Unique)
- `hire_date`, `birth_date`
- `address`, `city`, `state`, `zip_code`, `country`
- `is_active`
- `created_at`, `updated_at`

## 🔐 Authentication

### Test Credentials
- **Admin**: `admin@worksense.com` / `admin123`
- **User**: `john.doe@worksense.com` / `user123`

### API Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile (requires auth)

## 🚀 Running the Application

```bash
# Install dependencies
npm run setup

# Run both frontend and backend
npm run dev

# Or run individually
npm run dev:backend   # Backend on http://localhost:4001
npm run dev:frontend  # Frontend on http://localhost:5173
```

## ✅ Status
- ✅ PostgreSQL connected
- ✅ Database tables created
- ✅ Sample data seeded
- ✅ Authentication working
- ✅ Employee API working
- ✅ Proper MERN stack structure
