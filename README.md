# Tubes_Kriptografi

Repositori Tugas Besar IF4020 Kriptografi

## 🚀 How to Run

### Using Docker Compose (Recommended)

1. **Start the application:**

   ```bash
   docker-compose up --build
   ```

2. **Seed the database (first time setup):**
   ```bash
   docker-compose exec backend npm run db:seed
   ```

### Environment Configuration

The application uses environment variables for configuration. Default values are set in `docker-compose.yml`, but you can also create local `.env` files:

#### Backend Environment Variables

Copy `backend/.env.example` to `backend/.env` and adjust as needed:

- `PORT`: Backend server port (default: 3000)
- `DATABASE_URL`: PostgreSQL connection string
- `CLIENT_ORIGIN`: Frontend URL for CORS (default: http://localhost:3000)
- `API_BASE_URL`: Backend API base URL (default: http://localhost:3001/api)

#### Frontend Environment Variables

Copy `frontend/.env.example` to `frontend/.env` and adjust as needed:

- `VITE_BACKEND_URL`: Backend API URL for REST calls (default: http://localhost:3001/api/)
- `VITE_API_URL`: Backend base URL for Socket.IO connections (default: http://localhost:3001)

## 🌐 How to Access

- **Frontend**: [http://localhost:3000](http://localhost:3000) - Main application
- **Backend API**: [http://localhost:3001](http://localhost:3001) - REST API endpoints
